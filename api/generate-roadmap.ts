import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getAnthropicClient } from './claude.js';
import { checkRateLimit, recordApiCall } from './rateLimiter.js';
import type { DiagnosticInput, Grant, CommitteeRoadmap, Tranche, Deliverable } from '../src/types/index.js';

// In-memory cache keyed on SHA-256 of (DiagnosticInput + Grant ID)
const roadmapCache = new Map<string, { data: CommitteeRoadmap; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// Code-level overlap check between completed baseline (fieldA) and future deliverables
function checkDeliverableBaselineOverlap(fieldA: string, deliverableTitle: string, deliverableDesc: string): boolean {
  if (!fieldA) return false;
  const tokenize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

  const baselineWords = new Set(tokenize(fieldA));
  const deliverableWords = tokenize(`${deliverableTitle} ${deliverableDesc}`);
  if (deliverableWords.length === 0 || baselineWords.size === 0) return false;

  let overlapCount = 0;
  for (const word of deliverableWords) {
    if (baselineWords.has(word)) overlapCount++;
  }

  const ratio = overlapCount / deliverableWords.length;
  return ratio >= 0.40; // 40%+ token overlap with completed baseline
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { diagnostic, grant }: { diagnostic: DiagnosticInput; grant: Grant } = req.body;

  if (!diagnostic || !grant) {
    return res.status(400).json({ error: 'Invalid payload: Both diagnostic and grant are required.' });
  }

  // 1. Check SHA-256 cache (cache hits do not consume API credits or rate limit)
  const cacheKey = crypto
    .createHash('sha256')
    .update(JSON.stringify({ diagnostic, grantId: grant.id }))
    .digest('hex');

  const cached = roadmapCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.status(200).json({
      success: true,
      cached: true,
      roadmap: cached.data,
    });
  }

  // 2. Check Rate Limit (Max 3 Claude API calls per 10 minutes per IP)
  const rateLimit = checkRateLimit(req);
  if (!rateLimit.allowed) {
    const mins = Math.ceil(rateLimit.resetAfterSeconds / 60);
    return res.status(429).json({
      error: 'Rate limit reached',
      message: `You have reached the maximum limit of 3 AI analyses per 10-minute session to conserve credits. Please wait ${mins} minute(s) before generating another AI evaluation.`,
      retryAfterSeconds: rateLimit.resetAfterSeconds,
      remaining: 0,
    });
  }

  try {
    const { client, model } = getAnthropicClient();

    const totalGrantAmount = grant.max_amount_usd || 100000;
    const t1Amount = Math.round(totalGrantAmount * 0.3);
    const t2Amount = Math.round(totalGrantAmount * 0.4);
    const t3Amount = totalGrantAmount - t1Amount - t2Amount;

    const systemPrompt = `You are the GrantHer Lead Grant Underwriter and Committee Review Chair.
You are generating a 12-week, 3-tranche auditable non-dilutive execution roadmap for a grant committee.

CORE COMMITTEE MANDATE:
Committees fund future verified deliverables, not past activities. 

CRITICAL PROMPT CONSTRAINTS & VALUE PROPOSITION:
1. NEVER list something the founder already stated as completed in their traction baseline (fieldA) as a future milestone deliverable.
   - For example, if fieldA says "Built prototype and ran 20 user interviews", DO NOT assign "Build prototype" or "Interview 20 users" as a deliverable. Deliverables must be NET NEW milestones that build upon their past baseline to achieve their funding objective (fieldB).
2. NEVER invent vague, unmeasurable, or hand-waving tasks (e.g. "Do marketing", "Brainstorm features"). Every single deliverable must have concrete, objectively verifiable proof in 'verificationEvidence' (e.g. "Signed institutional MOU", "Audited smart contract on GitHub", "Clinical trial IRB approval letter", "Google Analytics export of 1,000 MAU").
3. Structure the roadmap into EXACTLY 3 tranches:
   - Tranche 1 (Weeks 1–4): Foundation & Technical Setup (30% budget: $${t1Amount.toLocaleString()})
   - Tranche 2 (Weeks 5–8): Core Deployment & Pilot Execution (40% budget: $${t2Amount.toLocaleString()})
   - Tranche 3 (Weeks 9–12): Validation, Audit & Committee Sign-Off (30% budget: $${t3Amount.toLocaleString()})
4. Directly tailor deliverables to fulfill the grant's specific evaluation criteria and resolve the grant's blindspot warning.`;

    const userMessage = `Venture Diagnostic Context:
- Startup Name: ${diagnostic.startupName}
- Tagline: ${diagnostic.tagline || 'N/A'}
- Sector: ${diagnostic.sector}
- Stage: ${diagnostic.stage}
- Region: ${diagnostic.region}
- Stated Traction Baseline (ALREADY COMPLETED - DO NOT REPEAT AS DELIVERABLES):
  "${diagnostic.fieldA}"
- Funding Objective & Milestones to Achieve:
  "${diagnostic.fieldB}"

Target Grant Information:
- Grant Name: ${grant.name}
- Funder: ${grant.funder}
- Total Grant Amount: $${totalGrantAmount.toLocaleString()} USD
- Evaluation Criteria:
  1. ${grant.evaluation_criteria[0]}
  2. ${grant.evaluation_criteria[1]}
  3. ${grant.evaluation_criteria[2]}
- Funder Blindspot Warning: ${grant.blindspot_warning}

Generate the exact 3-tranche committee roadmap using the output_committee_roadmap tool.`;

    const response = await client.messages.create({
      model,
      max_tokens: 3500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      tools: [
        {
          name: 'output_committee_roadmap',
          description: 'Output the structured 3-tranche committee milestone roadmap',
          input_schema: {
            type: 'object',
            properties: {
              tranches: {
                type: 'array',
                description: 'List of 3 milestone tranches',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', enum: [1, 2, 3] },
                    name: { type: 'string' },
                    timeline: { type: 'string' },
                    percentage: { type: 'number' },
                    amountUsd: { type: 'number' },
                    phaseObjective: { type: 'string' },
                    deliverables: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          title: { type: 'string' },
                          description: { type: 'string' },
                          verificationEvidence: {
                            type: 'string',
                            description: 'Objective, auditable artifact or third-party proof document',
                          },
                        },
                        required: ['id', 'title', 'description', 'verificationEvidence'],
                      },
                      minItems: 2,
                      maxItems: 3,
                    },
                  },
                  required: ['id', 'name', 'timeline', 'percentage', 'amountUsd', 'phaseObjective', 'deliverables'],
                },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ['tranches'],
          },
        },
      ],
      tool_choice: { type: 'tool', name: 'output_committee_roadmap' },
    });

    const toolUse = response.content.find((c) => c.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('Claude did not return structured tool output for committee roadmap.');
    }

    const toolInput = toolUse.input as { tranches: Tranche[] };
    if (!toolInput || !Array.isArray(toolInput.tranches) || toolInput.tranches.length !== 3) {
      throw new Error('Claude returned malformed tranches array.');
    }

    // Code-level check: Verify non-overlap with fieldA and ensure financial amounts
    const processedTranches: Tranche[] = toolInput.tranches.map((t, index) => {
      const defaultPercentage = index === 0 ? 30 : index === 1 ? 40 : 30;
      const defaultAmount = index === 0 ? t1Amount : index === 1 ? t2Amount : t3Amount;

      const checkedDeliverables: Deliverable[] = t.deliverables.map((d, dIdx) => {
        const hasOverlap = checkDeliverableBaselineOverlap(diagnostic.fieldA, d.title, d.description);
        if (hasOverlap) {
          console.warn(
            `[Anti-Overlap Alert] Deliverable "${d.title}" overlaps with completed baseline fieldA: "${diagnostic.fieldA}". Flagging for review.`
          );
        }

        return {
          id: d.id || `t${t.id}_d${dIdx + 1}`,
          title: d.title,
          description: d.description,
          verificationEvidence: d.verificationEvidence,
        };
      });

      return {
        id: index + 1,
        name: t.name || (index === 0 ? 'Foundation & Setup' : index === 1 ? 'Core Deployment' : 'Validation & Audit'),
        timeline: t.timeline || (index === 0 ? 'Weeks 1–4' : index === 1 ? 'Weeks 5–8' : 'Weeks 9–12'),
        percentage: t.percentage || defaultPercentage,
        amountUsd: t.amountUsd || defaultAmount,
        phaseObjective: t.phaseObjective,
        deliverables: checkedDeliverables,
      };
    });

    const completedRoadmap: CommitteeRoadmap = {
      grantId: grant.id,
      grantName: grant.name,
      funder: grant.funder,
      totalGrantUsd: totalGrantAmount,
      timelineWeeks: 12,
      startupName: diagnostic.startupName,
      tagline: diagnostic.tagline || '',
      targetSector: diagnostic.sector,
      targetRegion: diagnostic.region,
      currentTractionBaseline: diagnostic.fieldA,
      fundingObjective: diagnostic.fieldB,
      tranches: processedTranches,
    };

    // Record rate limit usage and cache the generated roadmap
    recordApiCall(req);
    roadmapCache.set(cacheKey, { data: completedRoadmap, timestamp: Date.now() });

    return res.status(200).json({
      success: true,
      cached: false,
      roadmap: completedRoadmap,
    });
  } catch (error: any) {
    console.error('Claude roadmap generation API error:', error);
    return res.status(500).json({
      error: 'Claude roadmap generation failed.',
      details: error?.message || String(error),
    });
  }
}
