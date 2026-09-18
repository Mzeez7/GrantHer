import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getAnthropicClient } from './claude.js';
import { checkRateLimit, recordApiCall } from './rateLimiter.js';
import type { DiagnosticInput, Grant, MatchedGrant } from '../src/types/index.js';
import grantsData from '../src/data/grants.json';

// In-memory response cache keyed on SHA-256 hash of DiagnosticInput
const matchCache = new Map<string, { data: MatchedGrant[]; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

const allGrants: Grant[] = grantsData as Grant[];

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

  const diagnostic: DiagnosticInput = req.body?.diagnostic || req.body;

  if (!diagnostic || !diagnostic.startupName) {
    return res.status(400).json({ error: 'Invalid payload: DiagnosticInput is required.' });
  }

  // 1. Check SHA-256 cache (cached hits do not consume API credits or rate limit)
  const cacheKey = crypto
    .createHash('sha256')
    .update(JSON.stringify(diagnostic))
    .digest('hex');

  const cached = matchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.status(200).json({
      success: true,
      cached: true,
      matches: cached.data,
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

  if (!allGrants || !allGrants.length) {
    return res.status(500).json({ error: 'Grants database could not be loaded.' });
  }

  try {
    const { client, model } = getAnthropicClient();

    // Select top 20 most relevant candidate grants across all 100 grants
    const sectorLower = diagnostic.sector.toLowerCase();
    const regionLower = diagnostic.region.toLowerCase();

    const scoredCandidates = allGrants.map((g) => {
      let relevance = 0;
      if (g.target_sectors.some((s) => s.toLowerCase().includes(sectorLower) || sectorLower.includes(s.toLowerCase()))) {
        relevance += 10;
      }
      if (g.eligible_regions.includes('Global') || g.eligible_regions.some((r) => r.toLowerCase().includes(regionLower))) {
        relevance += 5;
      }
      if (g.target_stage === diagnostic.stage) {
        relevance += 3;
      }
      if (diagnostic.womenLed && g.women_led_required) {
        relevance += 4;
      }
      return { grant: g, relevance };
    });

    scoredCandidates.sort((a, b) => b.relevance - a.relevance);
    const relevantGrants = scoredCandidates.slice(0, 20).map((c) => c.grant);

    const systemPrompt = `You are the GrantHer Senior Grant Evaluator and Underwriter.
Your task is to rigorously evaluate a female-led or early-stage venture against curated non-dilutive grant programs from our database.

CRITICAL EVALUATION RULES:
1. Ground every score (0-100) strictly in the grant's actual eligibility fields:
   - target_sectors: Is the venture's sector explicitly supported?
   - eligible_regions: Is the founder's region or Global covered?
   - target_stage: Does the venture match 'Idea', 'Prototype / MVP', or 'Early Growth'?
   - women_led_required: If true and founder is woman-led, grant high alignment.
   - evaluation_criteria: Assess how well the founder's traction baseline (fieldA) and funding target (fieldB) fulfill the grant's stated evaluation criteria.
2. NEVER hallucinate eligibility requirements or criteria not present in the provided grant data.
3. For each evaluated grant, provide exactly 3 verified alignment checkmarks in 'matchedCriteria'.
4. Provide a realistic, grounded 'blindspotAlert' derived directly from the grant's 'blindspot_warning' and eligibility constraints.
5. Rank and return the top high-fit matched grants sorted by matchScore descending.`;

    const userMessage = `Venture Profile:
- Startup Name: ${diagnostic.startupName}
- Tagline: ${diagnostic.tagline || 'N/A'}
- Sector: ${diagnostic.sector}
- Stage: ${diagnostic.stage}
- Region: ${diagnostic.region}
- Women-Led: ${diagnostic.womenLed ? 'Yes (Women-Led Venture)' : 'No'}
- Current Traction Baseline (Already Completed): "${diagnostic.fieldA}"
- Funding Target & Milestone Objective: "${diagnostic.fieldB}"

Candidate Grant Programs:
${relevantGrants
  .map(
    (g, idx) => `
[${idx + 1}] ID: ${g.id}
Name: ${g.name}
Funder: ${g.funder}
Max Amount: $${g.max_amount_usd}
Target Stage: ${g.target_stage}
Eligible Regions: ${g.eligible_regions.join(', ')}
Target Sectors: ${g.target_sectors.join(', ')}
Women-Led Required: ${g.women_led_required}
Evaluation Criteria:
1. ${g.evaluation_criteria[0]}
2. ${g.evaluation_criteria[1]}
3. ${g.evaluation_criteria[2]}
Blindspot Warning: ${g.blindspot_warning}
`
  )
  .join('\n---\n')}

Evaluate and output the top matched grants for this founder using the structured tool.`;

    const response = await client.messages.create({
      model,
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      tools: [
        {
          name: 'output_matched_grants',
          description: 'Output scored and evaluated grant matches for the founder',
          input_schema: {
            type: 'object',
            properties: {
              matches: {
                type: 'array',
                description: 'List of top matched grants evaluated by Claude',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', description: 'Grant ID matching candidate ID' },
                    matchScore: {
                      type: 'number',
                      description: 'Evaluated match fit score between 60 and 99',
                    },
                    matchedCriteria: {
                      type: 'array',
                      items: { type: 'string' },
                      minItems: 3,
                      maxItems: 3,
                      description: '3 concise bullet points of verified alignment',
                    },
                    blindspotAlert: {
                      type: 'string',
                      description: 'Specific warning or diligence hurdle for the founder',
                    },
                  },
                  required: ['id', 'matchScore', 'matchedCriteria', 'blindspotAlert'],
                },
              },
            },
            required: ['matches'],
          },
        },
      ],
      tool_choice: { type: 'tool', name: 'output_matched_grants' },
    });

    const toolUse = response.content.find((c) => c.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('Claude did not return structured tool output for grant matches.');
    }

    const toolInput = toolUse.input as { matches: Array<{ id: string; matchScore: number; matchedCriteria: string[]; blindspotAlert: string }> };
    if (!toolInput || !Array.isArray(toolInput.matches)) {
      throw new Error('Malformed tool output schema from Claude.');
    }

    // Hydrate matches with the full grant metadata from grants.json
    const grantMap = new Map(allGrants.map((g) => [g.id, g]));
    const matchedGrants: MatchedGrant[] = [];

    for (const m of toolInput.matches) {
      const grant = grantMap.get(m.id);
      if (grant) {
        matchedGrants.push({
          ...grant,
          matchScore: Math.min(100, Math.max(0, Math.round(m.matchScore))),
          matchedCriteria: m.matchedCriteria as [string, string, string],
          blindspotAlert: m.blindspotAlert || grant.blindspot_warning,
        });
      }
    }

    // Sort descending by matchScore
    matchedGrants.sort((a, b) => b.matchScore - a.matchScore);

    // Record rate limit usage and save to cache
    recordApiCall(req);
    matchCache.set(cacheKey, { data: matchedGrants, timestamp: Date.now() });

    return res.status(200).json({
      success: true,
      cached: false,
      matches: matchedGrants,
    });
  } catch (error: any) {
    console.error('Claude matching API error:', error);
    return res.status(500).json({
      error: 'Claude matching evaluation failed.',
      details: error?.message || String(error),
    });
  }
}
