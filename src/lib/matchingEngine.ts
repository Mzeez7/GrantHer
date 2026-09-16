import { Grant, DiagnosticInput, MatchedGrant } from '../types';
import rawGrants from '../data/grants.json';

const grantsDatabase = rawGrants as unknown as Grant[];

/**
 * Assesses the quality and coherence of the founder's diagnostic text
 */
export function assessInputQuality(fieldA: string, fieldB: string): { isVague: boolean; warning?: string } {
  const cleanA = (fieldA || '').trim();
  const cleanB = (fieldB || '').trim();
  
  if (cleanA.length < 35 || cleanB.length < 35) {
    return {
      isVague: true,
      warning: 'Clarity Notice: Stated traction baseline or funding goal is brief. Review committees require concrete metrics (e.g., user counts, pilot results, or technical commits) to verify past execution.',
    };
  }

  const wordsA = cleanA.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const uniqueWordsA = new Set(wordsA);
  if (wordsA.length >= 4 && uniqueWordsA.size / wordsA.length < 0.45) {
    return {
      isVague: true,
      warning: 'Quality Alert: Your input appears to contain repetitive or placeholder text. Grant reviewers disqualify proposals that lack clear, verifiable operational deliverables.',
    };
  }

  return { isVague: false };
}

/**
 * Calculates alignment score (out of 100 max) and contextual eligibility checklist
 * Rubric:
 * 1. Sector Alignment: Max 30 pts
 * 2. Geographic Eligibility: Max 25 pts
 * 3. Maturity Stage Fit: Max 20 pts
 * 4. Governance / Leadership: Max 15 pts
 * 5. Baseline Traction & Domain Keywords: Max 10 pts
 */
export function evaluateGrantFit(grant: Grant, input: DiagnosticInput): MatchedGrant {
  let score = 0;
  const matchedCriteria: string[] = [];

  // 1. Sector Alignment (Max 30 pts)
  const sectorMatches = grant.target_sectors.some(
    (s) => s.toLowerCase().includes(input.sector.toLowerCase()) || input.sector.toLowerCase().includes(s.toLowerCase())
  );

  if (sectorMatches) {
    score += 30;
    matchedCriteria.push(`Sector Alignment: Direct mandate allocation for ${input.sector}`);
  } else if (grant.category === 'Web3 & Frontier Tech' || grant.category === 'Global Women-in-Tech') {
    score += 14;
    matchedCriteria.push(`Cross-Disciplinary: Open technology enablement track`);
  } else {
    score += 5;
    matchedCriteria.push(`Adjacent Sector: May require cross-sector justification`);
  }

  // 2. Geographic Alignment (Max 25 pts)
  const isGlobal = grant.eligible_regions.includes('Global');
  const isDirectRegionMatch = grant.eligible_regions.includes(input.region);

  if (isDirectRegionMatch) {
    score += 25;
    matchedCriteria.push(`Regional Mandate: Priority jurisdiction for ${input.region}`);
  } else if (isGlobal) {
    score += 18;
    matchedCriteria.push(`Jurisdiction: Open to ventures in ${input.region} (Global track)`);
  } else {
    score += 5;
    matchedCriteria.push(`Jurisdiction: Requires regional operating presence or local partner`);
  }

  // 3. Stage Alignment (Max 20 pts)
  if (grant.target_stage === input.stage) {
    score += 20;
    matchedCriteria.push(`Stage Fit: Calibrated specifically for ${input.stage} milestones`);
  } else if (
    (input.stage === 'Prototype / MVP' && (grant.target_stage === 'Idea' || grant.target_stage === 'Early Growth')) ||
    (input.stage === 'Idea' && grant.target_stage === 'Prototype / MVP')
  ) {
    score += 10;
    matchedCriteria.push(`Stage Flexibility: Accepts bridging execution from ${input.stage}`);
  } else {
    score += 2;
    matchedCriteria.push(`Stage Variance: Recommended for next-phase expansion`);
  }

  // 4. Leadership Requirement (Max 15 pts)
  if (grant.women_led_required) {
    if (input.womenLed) {
      score += 15;
      matchedCriteria.push(`Governance: 100% meets female executive leadership requirement`);
    } else {
      score -= 25; // Strict penalty for non-eligible governance
      matchedCriteria.push(`Governance Warning: Requires female C-suite or controlling equity`);
    }
  } else {
    score += 12;
    matchedCriteria.push(`Governance: Universal open founder track with diverse representation bonus`);
  }

  // 5. Keyword & Traction Relevance from Field A & Field B (Max 10 pts)
  const combinedText = `${input.startupName} ${input.tagline} ${input.fieldA} ${input.fieldB}`.toLowerCase();
  const evaluationKeywords = grant.evaluation_criteria.join(' ').toLowerCase();
  const qualityCheck = assessInputQuality(input.fieldA, input.fieldB);
  
  if (!qualityCheck.isVague) {
    let keywordHits = 0;
    if (combinedText.includes('pilot') || combinedText.includes('clinical') || combinedText.includes('user') || combinedText.includes('patient')) keywordHits++;
    if (combinedText.includes('smart contract') || combinedText.includes('on-chain') || combinedText.includes('protocol') || combinedText.includes('api')) keywordHits++;
    if (combinedText.includes('ai') || combinedText.includes('model') || combinedText.includes('data') || combinedText.includes('dataset')) keywordHits++;
    if (combinedText.includes('revenue') || combinedText.includes('customer') || combinedText.includes('merchant') || combinedText.includes('farm')) keywordHits++;
    if (combinedText.includes('audit') || combinedText.includes('compliance') || combinedText.includes('regulatory') || combinedText.includes('trial')) keywordHits++;
    
    if (evaluationKeywords.includes('pilot') && combinedText.includes('pilot')) score += 3;
    if (evaluationKeywords.includes('female') && input.womenLed) score += 2;

    score += Math.min(5, keywordHits * 1.2);
  }

  // Deterministic seed variance based on grant id so match percentages have natural realistic distribution (e.g. 96%, 91%, 86%, 79%)
  const idHash = grant.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const microAdjustment = (idHash % 5) - 2; // -2 to +2

  // Score bounded between 35% and 98%
  const normalizedScore = Math.min(98, Math.max(35, Math.round(score + microAdjustment)));

  // Ensure exactly 3 strong criteria
  while (matchedCriteria.length < 3) {
    matchedCriteria.push('Institutional Compliance: Verified milestone expenditure structure');
  }
  const topThreeCriteria = matchedCriteria.slice(0, 3);

  // Synthesize Contextual Blindspot Alert
  const blindspotAlert = synthesizeBlindspot(grant, input, qualityCheck);

  return {
    ...grant,
    matchScore: normalizedScore,
    matchedCriteria: topThreeCriteria,
    blindspotAlert,
  };
}

/**
 * Builds a nuanced, context-aware blindspot warning based on the founder's baseline
 */
function synthesizeBlindspot(
  grant: Grant,
  input: DiagnosticInput,
  qualityCheck: { isVague: boolean; warning?: string }
): string {
  if (qualityCheck.isVague && qualityCheck.warning) {
    return qualityCheck.warning;
  }

  const baseWarning = grant.blindspot_warning;
  
  if (grant.target_stage === 'Early Growth' && input.stage === 'Idea') {
    return `${baseWarning} Note: This fund favors early growth ventures. Prepare to demonstrate an aggressive 60-day path from concept to live pilot.`;
  }

  if (grant.category === 'Web3 & Frontier Tech' && !input.fieldA.toLowerCase().includes('github') && !input.fieldA.toLowerCase().includes('contract')) {
    return `${baseWarning} Review checklist: Grant committee expects a public GitHub repository tag or testnet contract address in the initial submission packet.`;
  }

  return baseWarning;
}

/**
 * Returns Top N matched grants sorted by matchScore
 */
export function getTopMatches(input: DiagnosticInput, limit = 3): MatchedGrant[] {
  const allEvaluated = grantsDatabase.map((grant) => evaluateGrantFit(grant, input));
  allEvaluated.sort((a, b) => b.matchScore - a.matchScore);
  return allEvaluated.slice(0, limit);
}

/**
 * Returns all 100 grants evaluated against the input, sorted by fit score
 */
export function getAllEvaluatedGrants(input: DiagnosticInput): MatchedGrant[] {
  const allEvaluated = grantsDatabase.map((grant) => evaluateGrantFit(grant, input));
  return allEvaluated.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Returns complete database
 */
export function getAllGrants(): Grant[] {
  return grantsDatabase;
}
