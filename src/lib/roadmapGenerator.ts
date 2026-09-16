import { DiagnosticInput, MatchedGrant, CommitteeRoadmap, Tranche } from '../types';

/**
 * Generates a tailored, committee-ready 3-tranche fund release plan
 * Synthesizes Field A (Baseline/Traction) and Field B (Target Milestone) into
 * auditable, verifiable technical tranches aligned with committee best practices.
 */
/**
 * Generates a tailored, committee-ready 3-tranche fund release plan
 * Synthesizes Field A (Baseline/Traction) and Field B (Target Milestone) into
 * auditable, verifiable technical tranches aligned with committee best practices.
 */
export function generateCommitteeRoadmap(
  grant: MatchedGrant,
  input: DiagnosticInput,
  customAmount?: number
): CommitteeRoadmap {
  const totalGrantUsd = customAmount || grant.max_amount_usd;
  const sector = input.sector;
  const baseline = input.fieldA.trim();
  const targetBottleneck = input.fieldB.trim();

  // Compute standard 30% / 40% / 30% budget tranches
  const t1Amount = Math.round(totalGrantUsd * 0.3);
  const t2Amount = Math.round(totalGrantUsd * 0.4);
  const t3Amount = totalGrantUsd - t1Amount - t2Amount; // exact balance

  const tranches: Tranche[] = [
    {
      id: 1,
      name: 'Foundation & De-risking',
      timeline: 'Weeks 1–4',
      percentage: 30,
      amountUsd: t1Amount,
      phaseObjective: `Formalize technical specifications, regulatory clearances, and pre-deployment audits that bridge past achievements into ${grant.name} mandate.`,
      deliverables: generateTranche1Deliverables(sector, baseline, targetBottleneck, grant),
    },
    {
      id: 2,
      name: 'Implementation & Systems Integration',
      timeline: 'Weeks 5–8',
      percentage: 40,
      amountUsd: t2Amount,
      phaseObjective: `Execute core engineering and operational deployment targeting the primary bottleneck: "${truncate(targetBottleneck, 75)}" with staging telemetry.`,
      deliverables: generateTranche2Deliverables(sector, baseline, targetBottleneck, grant),
    },
    {
      id: 3,
      name: 'Validation, Pilot & KPI Attestation',
      timeline: 'Weeks 9–12',
      percentage: 30,
      amountUsd: t3Amount,
      phaseObjective: `Run formal live pilot cohorts, measure customer retention/efficiency KPIs, and compile third-party attested grant closure dossier.`,
      deliverables: generateTranche3Deliverables(sector, targetBottleneck, grant),
    },
  ];

  return {
    grantId: grant.id,
    grantName: grant.name,
    funder: grant.funder,
    totalGrantUsd,
    timelineWeeks: 12,
    startupName: input.startupName || 'Venture Candidate',
    tagline: input.tagline || 'High-Impact Technology Initiative',
    targetSector: input.sector,
    targetRegion: input.region,
    currentTractionBaseline: baseline,
    fundingObjective: targetBottleneck,
    tranches,
  };
}

/**
 * Tranche 1: Foundation & De-risking (Weeks 1-4)
 */
function generateTranche1Deliverables(sector: string, baseline: string, target: string, grant: MatchedGrant) {
  const grantName = grant.name.toLowerCase();
  const funder = grant.funder.toLowerCase();
  const isWeb3 = sector.toLowerCase().includes('web3') || grantName.includes('web3') || grantName.includes('crypto') || grantName.includes('ethereum');
  const isHealth = sector.toLowerCase().includes('health') || grantName.includes('health') || grantName.includes('biotech');
  const isAgri = sector.toLowerCase().includes('agri') || sector.toLowerCase().includes('climate') || grantName.includes('climate') || grantName.includes('earth');
  const isWomenSpecific = grant.women_led_required || grantName.includes('cartier') || grantName.includes('visa') || grantName.includes('women');
  const isAI = sector.toLowerCase().includes('ai') || grantName.includes('ai') || funder.includes('google') || funder.includes('microsoft');

  if (grantName.includes('cartier') || (isWomenSpecific && grantName.includes('initiative'))) {
    return [
      {
        id: 'del-1-1',
        title: 'Female Executive Leadership & Impact Governance Protocol',
        description: `Formalize gender-disaggregated impact measurement frameworks and baseline ESG reporting metrics, leveraging established progress (${truncate(baseline, 60)}).`,
        verificationEvidence: 'Impact Governance Charter ratified by female executive leadership and baseline SDG/ESG impact audit scorecard.',
      },
      {
        id: 'del-1-2',
        title: 'Operational De-risking & Clinical/Commercial Pilot Design',
        description: `Design structured operational deployment protocols and compliance roadmaps targeting: "${truncate(target, 60)}".`,
        verificationEvidence: 'Signed partnership Memoranda of Understanding (MoUs) with minimum 2 target deployment partners.',
      },
      {
        id: 'del-1-3',
        title: 'Financial Management System & Transparent Tranche Ledger',
        description: `Set up segregated grant expenditure accounting and independent milestone audit tracking.`,
        verificationEvidence: 'Segregated banking ledger setup confirmation and chartered accountant milestone tracking framework.',
      },
    ];
  }

  if (grantName.includes('visa') || grantName.includes('she\'s next') || sector.toLowerCase().includes('fintech')) {
    return [
      {
        id: 'del-1-1',
        title: 'Merchant/User Digital Rails & KYC Compliance Architecture',
        description: `Finalize regulatory compliance mapping, digital payment rail integration, and data privacy protocols (${truncate(baseline, 60)}).`,
        verificationEvidence: 'Regulatory compliance legal opinion memo and technical API integration architecture documentation.',
      },
      {
        id: 'del-1-2',
        title: 'Merchant Onboarding & Digital Commerce Sandbox',
        description: `Deploy merchant sandbox environment to stress-test onboarding workflows and payment reconciliation.`,
        verificationEvidence: 'Active merchant sandbox link, automated test transactions log, and merchant onboarding SOP.',
      },
      {
        id: 'del-1-3',
        title: 'Female Entrepreneur Community Outreach & Partner MoUs',
        description: `Establish partnerships with local trade associations and women business networks to recruit initial cohort.`,
        verificationEvidence: 'Executed partnership agreements with minimum 2 merchant associations representing 100+ businesses.',
      },
    ];
  }

  if (isAI || grantName.includes('google') || grantName.includes('nvidia') || grantName.includes('microsoft')) {
    return [
      {
        id: 'del-1-1',
        title: 'Model Benchmark Specification & Dataset Governance Protocol',
        description: `Establish data sanitization, privacy governance, and inference accuracy benchmarks, expanding prior data pipeline (${truncate(baseline, 60)}).`,
        verificationEvidence: 'Published model evaluation RFC, benchmark dataset documentation, and ethics compliance sign-off.',
      },
      {
        id: 'del-1-2',
        title: 'Cloud Infrastructure Provisioning & CI/CD Pipeline',
        description: `Deploy scalable cloud compute clusters with automated regression testing and latency telemetry.`,
        verificationEvidence: 'Infrastructure-as-Code (Terraform/Docker) commit hash, automated build telemetry, and staging endpoint URL.',
      },
      {
        id: 'del-1-3',
        title: 'Edge / Web Deployment Optimization & Sandbox Access',
        description: `Stress-test model latency and optimize memory footprint for low-bandwidth client execution.`,
        verificationEvidence: 'Benchmarking report displaying <150ms inference latency and developer API sandbox token generation logs.',
      },
    ];
  }

  if (isWeb3) {
    return [
      {
        id: 'del-1-1',
        title: 'Smart Contract Architecture Specification & Threat Model',
        description: `Formalize system architecture specifications and gas optimization benchmarks, building upon established baseline (${truncate(baseline, 60)}).`,
        verificationEvidence: 'Public GitHub repository tag, architecture RFC document, and internal static analysis audit report.',
      },
      {
        id: 'del-1-2',
        title: 'Testnet Staging Deployment & Automated CI/CD Test Suite',
        description: `Deploy verifiable contracts to public testnet with 100% test coverage for core state transitions and oracle invariants.`,
        verificationEvidence: 'Verified testnet explorer contract address, GitHub Actions passing build link, and unit/integration test coverage summary.',
      },
      {
        id: 'del-1-3',
        title: 'Independent Security Audit Engagement & Sandbox Setup',
        description: `Retain accredited third-party security firm for smart contract audit and establish developer integration sandbox for ecosystem partners.`,
        verificationEvidence: 'Countersigned audit engagement letter, preliminary findings memo, and public developer sandbox documentation portal.',
      },
    ];
  }

  if (isHealth) {
    return [
      {
        id: 'del-1-1',
        title: 'Clinical Ethics Clearance & Institutional Data Governance Protocol',
        description: `Secure institutional ethics board (IRB) review, patient data confidentiality safeguards, and local ministry compliance sign-offs (${truncate(baseline, 60)}).`,
        verificationEvidence: 'Formal Institutional Review Board (IRB) approval letter, HIPAA/GDPR data protection attestation, and regulatory registration.',
      },
      {
        id: 'del-1-2',
        title: 'Diagnostic Algorithm Validation Protocol & Calibration Benchmark',
        description: `Standardize clinical validation benchmarks against ground-truth datasets, building on validated baseline.`,
        verificationEvidence: 'Scientific validation benchmark report with ROC/AUC metrics signed by Principal Medical Investigator.',
      },
      {
        id: 'del-1-3',
        title: 'Pilot Partner Clinic Onboarding Agreements & SOP Manual',
        description: `Finalize MoUs with pilot hospital or clinic partners and author Standard Operating Procedure (SOP) manuals for frontline healthcare workers.`,
        verificationEvidence: 'Executed Memoranda of Understanding (MoUs) with minimum 2 clinical sites and published clinical workflow manual.',
      },
    ];
  }

  if (isAgri) {
    return [
      {
        id: 'del-1-1',
        title: 'Field Trial Protocol & Agronomic Baseline Sensor Mapping',
        description: `Design structured field trial sampling methodology across target farming clusters, expanding upon prior milestones (${truncate(baseline, 60)}).`,
        verificationEvidence: 'Documented field trial protocol ratified by local agricultural extension officers and GPS coordinate map of participating farms.',
      },
      {
        id: 'del-1-2',
        title: 'Hardware/IoT Calibration & Low-Bandwidth Telemetry Ingestion',
        description: `Stress-test IoT hardware or mobile SMS/USSD data pipelines in intermittent connectivity environments to prevent packet loss.`,
        verificationEvidence: 'Laboratory environmental stress test report, hardware firmware commit hash, and network latency telemetry log.',
      },
      {
        id: 'del-1-3',
        title: 'Farmer Cooperative Partnership Agreements & Training Curriculum',
        description: `Execute formal onboarding agreements with agricultural cooperatives and develop localized vernacular training materials.`,
        verificationEvidence: 'Signed partnership agreement with cooperative leadership representing 200+ smallholder farmers and training curriculum deck.',
      },
    ];
  }

  // Default: Enterprise SaaS, AI, B2B, etc.
  return [
    {
      id: 'del-1-1',
      title: 'Technical Architecture Specification & Security Baseline Review',
      description: `Author comprehensive system design document detailing API contracts, latency targets, and data isolation, extending current progress (${truncate(baseline, 60)}).`,
      verificationEvidence: 'Published engineering architecture RFC, OpenAPI v3 spec documentation, and SOC 2 / ISO 27001 gap assessment report.',
    },
    {
      id: 'del-1-2',
      title: 'Staging Infrastructure Deployment & Automated Testing Harness',
      description: `Provision automated staging infrastructure with end-to-end integration test harnesses targeting: "${truncate(target, 60)}".`,
      verificationEvidence: 'Authenticated staging environment URL, automated CI/CD pipeline telemetry, and test suite execution logs.',
    },
    {
      id: 'del-1-3',
      title: 'Regulatory & Commercial Pilot Framework Formalization',
      description: `Secure requisite legal regulatory opinions, data privacy filings, and preliminary trial participation agreements from early pilot customers.`,
      verificationEvidence: 'Legal counsel compliance memorandum, signed pilot non-disclosure/data-sharing agreements, and project milestone charter.',
    },
  ];
}

/**
 * Tranche 2: Implementation & Systems Integration (Weeks 5-8)
 */
function generateTranche2Deliverables(sector: string, baseline: string, target: string, grant: MatchedGrant) {
  const grantName = grant.name.toLowerCase();
  
  if (grantName.includes('cartier') || grant.women_led_required) {
    return [
      {
        id: 'del-2-1',
        title: 'Core Impact & Product Capability Deployment',
        description: `Execute core development sprints targeting: "${truncate(target, 70)}", linking output to female beneficiary and stakeholder outcomes.`,
        verificationEvidence: 'Production release tags, localized user interface deployment, and beneficiary feedback telemetry.',
      },
      {
        id: 'del-2-2',
        title: 'Mid-Stage Beneficiary Pilot & Operational Telemetry',
        description: `Onboard initial qualified cohort (50+ women-led businesses or community users) to measure adoption metrics and usability.`,
        verificationEvidence: 'Anonymized user cohort database logs, pilot engagement analytics, and uptime monitoring reports (>99.5%).',
      },
      {
        id: 'del-2-3',
        title: 'Mid-Term Milestone Review & Tranche 2 Financial Reconciliation',
        description: `Execute mid-term operational audit verifying zero compliance violations and reconciling all Tranche 1 expenditure against budget.`,
        verificationEvidence: 'Mid-term milestone sign-off memo, general ledger disbursement receipts, and updated burn-rate forecast.',
      },
    ];
  }

  return [
    {
      id: 'del-2-1',
      title: 'Core Feature Production Build & API Integration',
      description: `Complete primary engineering sprints for ${sector} architecture to resolve the core milestone: "${truncate(target, 70)}", strictly integrating with verified foundation (${truncate(baseline, 40)}).`,
      verificationEvidence: 'Production release tags on Git repository, interactive API playground documentation, and latency performance benchmarks.',
    },
    {
      id: 'del-2-2',
      title: 'Target User Cohort Onboarding & Telemetry Instrumentation',
      description: `Onboard initial qualified ${sector} user cohort (50–100 beta participants) with full real-time telemetry monitoring to track funnel bottlenecks.`,
      verificationEvidence: 'Anonymized user onboarding database logs, Mixpanel/PostHog analytics dashboard export, and uptime monitoring reports (>99.5%).',
    },
    {
      id: 'del-2-3',
      title: 'Mid-Stage Operational Audit & Tranche 2 Financial Reconciliation',
      description: `Execute mid-term technical audit to verify zero critical vulnerabilities and reconcile all Tranche 1 expenditure against approved budget categories.`,
      verificationEvidence: 'Mid-term independent audit sign-off sheet, general ledger disbursement receipts, and updated burn-rate forecast spreadsheet.',
    },
  ];
}

/**
 * Tranche 3: Validation, Pilot & KPI Attestation (Weeks 9-12)
 */
function generateTranche3Deliverables(sector: string, target: string, grant: MatchedGrant) {
  return [
    {
      id: 'del-3-1',
      title: 'Full-Scale Operational Pilot Execution & Impact Metric Capture',
      description: `Run uninterrupted 30-day live deployment across participating ${sector} partner sites, collecting empirical performance and efficiency telemetry.`,
      verificationEvidence: `Comprehensive pilot trial dataset, telemetry event logs (>10,000 interactions), and compliance sign-off for ${grant.name}.`,
    },
    {
      id: 'del-3-2',
      title: 'Third-Party Impact & Customer Attestation Letters',
      description: `Gather formal written attestations from pilot participants validating that the technology successfully resolved the designated bottleneck: "${truncate(target, 60)}".`,
      verificationEvidence: 'Minimum 3 executed Partner Impact Attestation Letters on official letterhead detailing verified outcomes.',
    },
    {
      id: 'del-3-3',
      title: 'Grant Completion Dossier & Commercial Scale-Up Plan',
      description: `Synthesize final grant evaluation report, open-source deliverables (if required), and post-grant commercialization trajectory.`,
      verificationEvidence: 'Comprehensive 15-page Grant Closeout Dossier, audited financial expenditure reconciliation, and public demo video link.',
    },
  ];
}

function truncate(text: string, maxLen: number): string {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen).trim() + '…' : text;
}
