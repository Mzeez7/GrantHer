import { CommitteeRoadmap } from '../types';

/**
 * Formats the CommitteeRoadmap into an executive Markdown brief
 */
export function generateMarkdownBrief(roadmap: CommitteeRoadmap): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `# Grant Proposal & Committee Milestone Roadmap
**Target Grant Program:** ${roadmap.grantName}
**Funder Entity:** ${roadmap.funder}
**Requested Capital:** $${roadmap.totalGrantUsd.toLocaleString()} USD (100% Non-dilutive)
**Execution Horizon:** ${roadmap.timelineWeeks} Weeks (Structured 3-Tranche Release)
**Date Prepared:** ${dateStr}

---

## 1. Executive Venture Overview
- **Venture Name:** ${roadmap.startupName}
- **Tagline:** ${roadmap.tagline}
- **Operating Sector:** ${roadmap.targetSector}
- **Jurisdiction / Region:** ${roadmap.targetRegion}

### Stated Baseline & Historical Traction (Already Validated)
> ${roadmap.currentTractionBaseline || 'Baseline documented in preliminary intake.'}

### Specific Funding Milestone Objective (Grant Allocation Bottleneck)
> ${roadmap.fundingObjective || 'Target milestone articulated for grant deployment.'}

---

## 2. Capital Tranche Allocation & Milestone Gates

${roadmap.tranches
  .map(
    (tranche) => `### Tranche ${tranche.id}: ${tranche.name}
- **Budget Allocation:** $${tranche.amountUsd.toLocaleString()} USD (${tranche.percentage}% of total award)
- **Target Horizon:** ${tranche.timeline}
- **Phase Objective:** ${tranche.phaseObjective}

**Required Deliverables & Verification Evidence:**
${tranche.deliverables
  .map(
    (d, i) => `#### Deliverable ${tranche.id}.${i + 1}: ${d.title}
- **Operational Scope:** ${d.description}
- **Verification Proof for Committee:** \`${d.verificationEvidence}\`
`
  )
  .join('\n')}
`
  )
  .join('\n---\n\n')}

## 3. Committee Governance & Attestation Notice
- Funds disbursed are strictly non-dilutive and allocated against verified evidence packets.
- Each milestone gate requires committee ratification of submitted verification proofs prior to subsequent tranche unlocking.
- Generated via GrantHer Institutional Grant Intelligence Engine.
`;
}

/**
 * Copies text to clipboard with modern navigator API and fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

/**
 * Downloads a file to the user's computer
 */
export function downloadFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
