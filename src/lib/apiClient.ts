import { DiagnosticInput, Grant, MatchedGrant, CommitteeRoadmap } from '../types';
import { getTopMatches, evaluateGrantFit } from './matchingEngine';
import { generateCommitteeRoadmap } from './roadmapGenerator';

const API_TIMEOUT_MS = 15000; // 15s timeout

/**
 * Evaluates candidate grants using Claude API, with seamless fallback to deterministic matching.
 */
export async function matchGrantsWithClaude(
  diagnostic: DiagnosticInput
): Promise<{ matches: MatchedGrant[]; isAiPowered: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch('/api/match-grants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnostic }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.matches) && data.matches.length > 0) {
        return { matches: data.matches, isAiPowered: true };
      }
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[Claude Match API Fallback]', err?.name === 'AbortError' ? 'Request timed out after 15s.' : err?.message);
  }

  // Graceful fallback to deterministic matching
  const fallbackMatches = getTopMatches(diagnostic, 3);
  return { matches: fallbackMatches, isAiPowered: false };
}

/**
 * Generates an auditable 3-tranche committee roadmap using Claude API, with seamless fallback.
 */
export async function generateRoadmapWithClaude(
  selectedGrant: Grant | MatchedGrant,
  diagnostic: DiagnosticInput
): Promise<{ roadmap: CommitteeRoadmap; isAiPowered: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch('/api/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnostic, grant: selectedGrant }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.roadmap && Array.isArray(data.roadmap.tranches)) {
        return { roadmap: data.roadmap, isAiPowered: true };
      }
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[Claude Roadmap API Fallback]', err?.name === 'AbortError' ? 'Request timed out after 15s.' : err?.message);
  }

  // Graceful fallback to deterministic template generator
  const matched: MatchedGrant =
    'matchScore' in selectedGrant
      ? selectedGrant
      : evaluateGrantFit(selectedGrant, diagnostic);
  const fallbackRoadmap = generateCommitteeRoadmap(matched, diagnostic);
  return { roadmap: fallbackRoadmap, isAiPowered: false };
}
