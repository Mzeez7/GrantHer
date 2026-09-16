import { DiagnosticInput, CommitteeRoadmap } from '../types';

export interface SaveRoadmapResult {
  success: boolean;
  id: string;
  shareUrl: string;
  isLocalFallback?: boolean;
}

export async function saveRoadmapToNeon(
  roadmap: CommitteeRoadmap,
  diagnostic?: DiagnosticInput
): Promise<SaveRoadmapResult> {
  const fallbackId = `gh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const shareUrl = `${window.location.origin}${window.location.pathname}?roadmap=${fallbackId}`;

  // LocalStorage backup first to ensure zero data loss
  try {
    const backupPayload = {
      roadmap,
      diagnostic,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`granther_roadmap_${fallbackId}`, JSON.stringify(backupPayload));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  try {
    const res = await fetch('/api/save-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        diagnostic: diagnostic ? { ...diagnostic, id: fallbackId } : null,
        roadmap: roadmap.tranches,
        grantName: roadmap.grantName,
        funder: roadmap.funder,
        totalGrantUsd: roadmap.totalGrantUsd,
        grantId: roadmap.grantId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const serverId = data.id || fallbackId;
      const actualShareUrl = `${window.location.origin}${window.location.pathname}?roadmap=${serverId}`;
      return {
        success: true,
        id: serverId,
        shareUrl: actualShareUrl,
        isLocalFallback: false,
      };
    }
  } catch (error) {
    console.warn('Serverless API unreachable, using local storage state fallback:', error);
  }

  // Graceful fallback if server API is not configured yet in local preview
  return {
    success: true,
    id: fallbackId,
    shareUrl,
    isLocalFallback: true,
  };
}

export async function getRoadmapFromNeon(
  id: string
): Promise<{ roadmap: CommitteeRoadmap; diagnostic: DiagnosticInput | null } | null> {
  // Try remote API first
  try {
    const res = await fetch(`/api/get-roadmap?id=${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      const roadmap: CommitteeRoadmap = {
        grantId: data.grantId || 'custom-grant',
        grantName: data.grantName || 'Grant Allocation Roadmap',
        funder: data.funder || 'Grant Committee',
        totalGrantUsd: data.totalGrantUsd || 100000,
        timelineWeeks: 24,
        startupName: data.diagnostic?.startupName || 'Venture',
        tagline: data.diagnostic?.tagline || '',
        targetSector: data.diagnostic?.sector || '',
        targetRegion: data.diagnostic?.region || '',
        currentTractionBaseline: data.diagnostic?.fieldA || '',
        fundingObjective: data.diagnostic?.fieldB || '',
        tranches: data.tranches || [],
      };

      const diagnostic: DiagnosticInput | null = data.diagnostic
        ? {
            startupName: data.diagnostic.startupName || '',
            tagline: data.diagnostic.tagline || '',
            sector: data.diagnostic.sector || '',
            region: data.diagnostic.region || '',
            stage: data.diagnostic.stage || 'Prototype / MVP',
            womenLed: data.diagnostic.womenLed ?? true,
            fieldA: data.diagnostic.fieldA || '',
            fieldB: data.diagnostic.fieldB || '',
          }
        : null;

      return { roadmap, diagnostic };
    }
  } catch (err) {
    console.warn('Failed to fetch from /api/get-roadmap:', err);
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(`granther_roadmap_${id}`);
    if (local) {
      const parsed = JSON.parse(local);
      return {
        roadmap: parsed.roadmap,
        diagnostic: parsed.diagnostic || null,
      };
    }
  } catch (e) {
    console.warn('Failed to load roadmap from localStorage:', e);
  }

  return null;
}
