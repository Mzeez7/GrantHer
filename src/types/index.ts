export type Stage = 'Idea' | 'Prototype / MVP' | 'Early Growth';

export type CycleStatus = 
  | 'Rolling / Always Open' 
  | 'Active Q3/Q4 Window' 
  | 'Annual Recurring Cycle' 
  | 'Biannual Cohort';

export interface Grant {
  id: string;
  name: string;
  funder: string;
  max_amount_usd: number;
  target_stage: Stage;
  eligible_regions: string[];
  target_sectors: string[];
  women_led_required: boolean;
  grant_type: 'Non-dilutive Grant';
  evaluation_criteria: [string, string, string];
  application_url: string;
  typical_turnaround: string;
  cycle_status: CycleStatus;
  deadline_note: string;
  blindspot_warning: string;
  category: 'Global Women-in-Tech' | 'Pan-African & Emerging Markets' | 'Web3 & Frontier Tech' | 'Multilateral & Climate';
  synopsis: string;
}

export interface DiagnosticInput {
  startupName: string;
  tagline: string;
  region: string;
  stage: Stage;
  sector: string;
  womenLed: boolean;
  fieldA: string; // Baseline & Traction (Already completed)
  fieldB: string; // Next Milestone / Funding Target (To be funded)
}

export interface MatchedGrant extends Grant {
  matchScore: number; // 0 to 100 percentage
  matchedCriteria: string[]; // 3 verified alignment checkmarks
  blindspotAlert: string; // Contextual amber warning
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  verificationEvidence: string;
}

export interface Tranche {
  id: number;
  name: string;
  timeline: string;
  percentage: number;
  amountUsd: number;
  phaseObjective: string;
  deliverables: Deliverable[];
}

export interface CommitteeRoadmap {
  grantId: string;
  grantName: string;
  funder: string;
  totalGrantUsd: number;
  timelineWeeks: number;
  startupName: string;
  tagline: string;
  targetSector: string;
  targetRegion: string;
  currentTractionBaseline: string;
  fundingObjective: string;
  tranches: Tranche[];
}
