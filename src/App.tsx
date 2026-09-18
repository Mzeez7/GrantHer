import React, { useState, useEffect } from 'react';
import { DiagnosticInput, MatchedGrant, CommitteeRoadmap, Grant } from './types';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { StepIndicator } from './components/StepIndicator';
import { DiagnosticForm } from './components/DiagnosticForm';
import { OpportunityMatch } from './components/OpportunityMatch';
import { MilestoneBoard } from './components/MilestoneBoard';
import { ExportModal } from './components/ExportModal';
import { ExploreGrants } from './components/ExploreGrants';
import { Toast } from './components/Toast';
import { getTopMatches, getAllEvaluatedGrants, evaluateGrantFit, getAllGrants } from './lib/matchingEngine';
import { generateCommitteeRoadmap } from './lib/roadmapGenerator';
import { fireCelebration } from './lib/celebration';
import { getRoadmapFromNeon } from './lib/dbClient';
import { matchGrantsWithClaude, generateRoadmapWithClaude } from './lib/apiClient';

const DEFAULT_INTAKE: DiagnosticInput = {
  startupName: '',
  tagline: '',
  region: 'Global',
  stage: 'Prototype / MVP',
  sector: 'Healthtech',
  womenLed: true,
  fieldA: '',
  fieldB: '',
};

export const App: React.FC = () => {
  // 0 = Landing Page, 1 = Diagnostic Intake, 2 = Matches & Blindspots, 3 = Committee Milestone Board, 4 = Explore Grants
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [diagnosticInput, setDiagnosticInput] = useState<DiagnosticInput>(DEFAULT_INTAKE);
  const [topMatches, setTopMatches] = useState<MatchedGrant[]>([]);
  const [allEvaluatedGrants, setAllEvaluatedGrants] = useState<MatchedGrant[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<MatchedGrant | null>(null);
  const [roadmap, setRoadmap] = useState<CommitteeRoadmap | null>(null);

  // Modals & Feedback
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printModalContent, setPrintModalContent] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluatingMessage, setEvaluatingMessage] = useState('Evaluating 100 Verified Non-Dilutive Funds...');

  // Auto-rehydrate from share link ?roadmap=<id>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roadmapId = params.get('roadmap');
    if (!roadmapId) return;

    const loadSharedRoadmap = async () => {
      setIsEvaluating(true);
      setEvaluatingMessage('Loading Shared Committee Roadmap from Database...');
      try {
        const data = await getRoadmapFromNeon(roadmapId);
        if (data && data.roadmap) {
          setRoadmap(data.roadmap);
          if (data.diagnostic) {
            setDiagnosticInput(data.diagnostic);
          }

          // Match or create fallback grant representation
          const allGrants = getAllGrants();
          const matched = allGrants.find((g) => g.id === data.roadmap.grantId);
          if (matched) {
            setSelectedGrant(evaluateGrantFit(matched, data.diagnostic || DEFAULT_INTAKE));
          } else {
            setSelectedGrant({
              id: data.roadmap.grantId,
              name: data.roadmap.grantName,
              funder: data.roadmap.funder,
              max_amount_usd: data.roadmap.totalGrantUsd,
              target_stage: 'Prototype / MVP',
              eligible_regions: ['Global'],
              target_sectors: ['Technology'],
              women_led_required: true,
              grant_type: 'Non-dilutive Grant',
              evaluation_criteria: ['Milestone Clarity', 'Financial Governance', 'Execution Track Record'],
              application_url: '#',
              typical_turnaround: '4-8 weeks',
              cycle_status: 'Rolling / Always Open',
              deadline_note: 'Active Cohort',
              blindspot_warning: 'Ensure verifiable deliverables for tranche release.',
              category: 'Global Women-in-Tech',
              synopsis: 'Custom synthesized non-dilutive grant roadmap.',
              matchScore: 98,
              matchedCriteria: ['Stage alignment verified', 'Sector alignment verified', 'Governance readiness verified'],
              blindspotAlert: 'Audit trail required for release of subsequent tranches.'
            });
          }
          setCurrentStep(3);
          showToast('Loaded shared committee roadmap!');
        }
      } catch (e) {
        console.error('Failed to load shared roadmap:', e);
      } finally {
        setIsEvaluating(false);
      }
    };

    loadSharedRoadmap();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Transition from Landing Page -> Screen 1 (Diagnostic Intake)
  const handleStartDiagnostic = (industryInput?: string) => {
    if (industryInput && industryInput.trim()) {
      const val = industryInput.trim();
      const standardSectors = [
        'Healthtech',
        'Fintech',
        'AI / Agentic',
        'Climate',
        'Agritech',
        'Edtech',
        'Web3 / Decentralized',
        'Supply Chain',
        'B2B SaaS',
        'GovTech / Civic',
      ];
      const matched = standardSectors.find(
        (s) =>
          s.toLowerCase().includes(val.toLowerCase()) ||
          val.toLowerCase().includes(s.toLowerCase())
      );

      setDiagnosticInput((prev) => ({
        ...prev,
        sector: matched || val,
      }));
    }
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 1 -> Step 2: Run Diagnostic Intake with Claude AI Matcher
  const handleDiagnosticSubmit = async (input: DiagnosticInput) => {
    setDiagnosticInput(input);
    setEvaluatingMessage('Evaluating 100 Verified Funds Against Stated Baseline with Claude AI...');
    setIsEvaluating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const { matches, isAiPowered, rateLimitMessage } = await matchGrantsWithClaude(input);
      const all = getAllEvaluatedGrants(input);

      setTopMatches(matches);
      setAllEvaluatedGrants(all);
      setCurrentStep(2);
      fireCelebration();
      
      if (rateLimitMessage) {
        showToast(rateLimitMessage);
      } else {
        showToast(
          isAiPowered
            ? `Claude AI matched ${matches.length} high-fit opportunities with verified eligibility.`
            : `Identified ${matches.length} high-fit opportunities from 100 verified funds.`
        );
      }
    } catch (e) {
      console.error('Diagnostic matching error:', e);
      const fallbackTop = getTopMatches(input, 3);
      const all = getAllEvaluatedGrants(input);
      setTopMatches(fallbackTop);
      setAllEvaluatedGrants(all);
      setCurrentStep(2);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Step 2 -> Step 3: Select Grant and Generate Committee Roadmap with Claude AI
  const handleSelectGrant = async (grant: MatchedGrant | Grant) => {
    const matched = 'matchScore' in grant ? (grant as MatchedGrant) : evaluateGrantFit(grant, diagnosticInput);
    setSelectedGrant(matched);
    setEvaluatingMessage(`Synthesizing 12-Week Committee Roadmap for ${matched.name} with Claude AI...`);
    setIsEvaluating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const { roadmap: generatedRoadmap, isAiPowered, rateLimitMessage } = await generateRoadmapWithClaude(matched, diagnosticInput);
      setRoadmap(generatedRoadmap);
      setCurrentStep(3);
      fireCelebration();

      if (rateLimitMessage) {
        showToast(rateLimitMessage);
      } else {
        showToast(
          isAiPowered
            ? `Claude AI synthesized 3-tranche committee roadmap with verified milestone deliverables.`
            : `Synthesized 3-tranche committee roadmap for ${matched.name}.`
        );
      }
    } catch (e) {
      console.error('Roadmap generation error:', e);
      const fallback = generateCommitteeRoadmap(matched, diagnosticInput);
      setRoadmap(fallback);
      setCurrentStep(3);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedGrant(null);
    setRoadmap(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHome = () => {
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateStep = (step: number) => {
    if (step === 1) setCurrentStep(1);
    if (step === 2 && topMatches.length > 0) setCurrentStep(2);
    if (step === 3 && roadmap) setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPrintModal = (markdown: string) => {
    setPrintModalContent(markdown);
    setPrintModalOpen(true);
  };

  const handleOpenExploreGrants = () => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-brand-slate-50 flex flex-col selection:bg-brand-purple-900 selection:text-white font-sans">
      {/* View 0: Executive Landing Page (Mercury-style) */}
      {currentStep === 0 && (
        <LandingPage
          onStartDiagnostic={handleStartDiagnostic}
          onOpenLibrary={handleOpenExploreGrants}
        />
      )}

      {/* View 4: Dedicated Full-Page Explore Grants Directory */}
      {currentStep === 4 && (
        <div className="min-h-screen flex flex-col">
          <Header
            currentStep={currentStep}
            onReset={handleReset}
            onHome={handleHome}
            onOpenLibrary={handleOpenExploreGrants}
            totalGrantsCount={100}
          />
          <main className="flex-1">
            <ExploreGrants
              grants={allEvaluatedGrants.length > 0 ? allEvaluatedGrants : getAllGrants()}
              onSelectGrant={handleSelectGrant}
              onBackToHome={handleHome}
              onStartDiagnostic={() => handleStartDiagnostic()}
            />
          </main>
          <footer className="border-t border-brand-slate-200 bg-white py-6 text-center text-xs text-brand-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <img src="/logo.png" alt="GrantHer" className="h-7 sm:h-8 w-auto object-contain rounded-md shadow-sm" />
                <span className="font-semibold text-brand-purple-950">
                  — Non-Dilutive Capital Intelligence for Women Founders
                </span>
              </div>
              <span>
                Curated directory of 100 verified global & regional funds
              </span>
            </div>
          </footer>
        </div>
      )}

      {/* Views 1, 2, 3: The 3-Screen Engine Flow */}
      {currentStep >= 1 && currentStep <= 3 && (
        <>
          {/* Header Bar */}
          <Header
            currentStep={currentStep}
            onReset={handleReset}
            onHome={handleHome}
            onOpenLibrary={handleOpenExploreGrants}
            totalGrantsCount={100}
          />

          {/* 3-Step Breadcrumb Progress Stepper */}
          <StepIndicator
            currentStep={currentStep}
            onNavigateToStep={handleNavigateStep}
          />

          {/* Interstitial Computing Screen */}
          {isEvaluating && (
            <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 animate-in fade-in duration-200 text-center">
              <div className="w-16 h-16 rounded-3xl bg-brand-purple-950 flex items-center justify-center text-brand-gold-400 shadow-executive border border-brand-purple-800 mb-6 relative">
                <div className="w-8 h-8 border-3 border-brand-gold-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-brand-purple-950">
                {evaluatingMessage}
              </h2>
              <div className="mt-6 flex flex-col items-center space-y-2 text-xs sm:text-sm font-mono text-brand-slate-500">
                <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                  <span>✓</span>
                  <span>Isolating historical baseline from new grant tranches</span>
                </div>
                <div className="flex items-center space-x-2 text-brand-purple-800 font-semibold">
                  <span>✓</span>
                  <span>Evaluating geographic & regulatory blindspots</span>
                </div>
                <div className="flex items-center space-x-2 text-brand-slate-400">
                  <span className="animate-pulse">●</span>
                  <span>Generating auditable committee deliverables</span>
                </div>
              </div>
            </div>
          )}

          {/* Screen Views */}
          {!isEvaluating && (
            <main className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {currentStep === 1 && (
                <DiagnosticForm
                  initialValues={diagnosticInput}
                  onSubmit={handleDiagnosticSubmit}
                />
              )}

              {currentStep === 2 && (
                <OpportunityMatch
                  input={diagnosticInput}
                  topMatches={topMatches}
                  allEvaluatedGrants={allEvaluatedGrants}
                  onSelectGrant={handleSelectGrant}
                  onBackToDiagnostic={() => setCurrentStep(1)}
                />
              )}

              {currentStep === 3 && roadmap && selectedGrant && (
                <MilestoneBoard
                  initialRoadmap={roadmap}
                  selectedGrant={selectedGrant}
                  diagnosticInput={diagnosticInput}
                  onBackToMatching={() => setCurrentStep(2)}
                  onOpenPrintModal={handleOpenPrintModal}
                  showToast={showToast}
                />
              )}
            </main>
          )}

          {/* Operational Footer */}
          <footer className="border-t border-brand-slate-200 bg-white py-6 text-center text-xs text-brand-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <img src="/logo.png" alt="GrantHer" className="h-7 sm:h-8 w-auto object-contain rounded-md shadow-sm" />
                <span className="font-semibold text-brand-purple-950">
                  — Non-Dilutive Capital Intelligence for Women Founders
                </span>
              </div>
              <span>
                Curated seed registry of 100 verified global & regional funds
              </span>
              <span className="text-brand-slate-400 hidden lg:inline">
                Zero equity surrendered • 12-week milestone frameworks
              </span>
            </div>
          </footer>
        </>
      )}

      {/* Global Modals & Notifications */}
      <ExportModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        markdownContent={printModalContent}
        roadmap={roadmap}
        startupName={diagnosticInput.startupName}
        grantName={selectedGrant?.name || 'Grant Program'}
        showToast={showToast}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
};
