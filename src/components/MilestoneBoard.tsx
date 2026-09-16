import React, { useState } from 'react';
import { CommitteeRoadmap, Tranche, MatchedGrant, DiagnosticInput } from '../types';
import { TrancheCard } from './TrancheCard';
import {
  generateMarkdownBrief,
  copyToClipboard,
  downloadFile,
} from '../lib/exportUtils';
import { assessInputQuality } from '../lib/matchingEngine';
import { fireCelebration } from '../lib/celebration';
import { saveRoadmapToNeon } from '../lib/dbClient';
import {
  ArrowLeft,
  Copy,
  Download,
  Printer,
  CheckCircle,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Share2,
  Check,
  Loader2,
} from 'lucide-react';

interface MilestoneBoardProps {
  initialRoadmap: CommitteeRoadmap;
  selectedGrant: MatchedGrant;
  diagnosticInput?: DiagnosticInput;
  onBackToMatching: () => void;
  onOpenPrintModal: (markdown: string) => void;
  showToast: (msg: string) => void;
}

export const MilestoneBoard: React.FC<MilestoneBoardProps> = ({
  initialRoadmap,
  selectedGrant,
  diagnosticInput,
  onBackToMatching,
  onOpenPrintModal,
  showToast,
}) => {
  const [roadmap, setRoadmap] = useState<CommitteeRoadmap>(initialRoadmap);
  const [requestedAmount, setRequestedAmount] = useState<number>(
    initialRoadmap.totalGrantUsd
  );
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedShareUrl, setSavedShareUrl] = useState<string | null>(null);

  // Recalculate tranche budget allocations when total requested amount changes
  const handleAmountChange = (newAmount: number) => {
    const validAmount = Math.max(1000, Math.min(selectedGrant.max_amount_usd, newAmount));
    setRequestedAmount(validAmount);

    const t1Amount = Math.round(validAmount * 0.3);
    const t2Amount = Math.round(validAmount * 0.4);
    const t3Amount = validAmount - t1Amount - t2Amount;

    const updatedTranches = roadmap.tranches.map((t) => {
      if (t.id === 1) return { ...t, amountUsd: t1Amount };
      if (t.id === 2) return { ...t, amountUsd: t2Amount };
      if (t.id === 3) return { ...t, amountUsd: t3Amount };
      return t;
    });

    setRoadmap({
      ...roadmap,
      totalGrantUsd: validAmount,
      tranches: updatedTranches,
    });
  };

  const handleUpdateTranche = (updatedTranche: Tranche) => {
    const updated = roadmap.tranches.map((t) =>
      t.id === updatedTranche.id ? updatedTranche : t
    );
    setRoadmap({ ...roadmap, tranches: updated });
    showToast(`Tranche ${updatedTranche.id} deliverables updated.`);
  };

  const handleCopyMarkdown = async () => {
    const md = generateMarkdownBrief(roadmap);
    const success = await copyToClipboard(md);
    if (success) {
      setCopied(true);
      fireCelebration();
      showToast('Committee Brief copied to clipboard as formatted Markdown!');
      setTimeout(() => setCopied(false), 3000);
    } else {
      showToast('Unable to copy automatically. Please use the Print/Download option.');
    }
  };

  const handleDownloadTxt = () => {
    const md = generateMarkdownBrief(roadmap);
    const filename = `${roadmap.startupName.toLowerCase().replace(/\s+/g, '_')}_${selectedGrant.id}_committee_brief.txt`;
    downloadFile(filename, md, 'text/plain;charset=utf-8');
    fireCelebration();
    showToast(`Downloaded ${filename}`);
  };

  const handleOpenPrint = () => {
    const md = generateMarkdownBrief(roadmap);
    onOpenPrintModal(md);
  };

  const handleSaveAndShare = async () => {
    setIsSaving(true);
    try {
      const result = await saveRoadmapToNeon(roadmap, diagnosticInput);
      setSavedShareUrl(result.shareUrl);
      await copyToClipboard(result.shareUrl);
      fireCelebration();
      showToast(
        result.isLocalFallback
          ? 'Roadmap saved! Share link copied to clipboard.'
          : 'Roadmap persisted to Neon Postgres! Share link copied to clipboard.'
      );
    } catch (err) {
      console.error(err);
      showToast('Error persisting roadmap. Saved to local browser state.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={onBackToMatching}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-brand-slate-500 hover:text-brand-purple-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunity Matches</span>
        </button>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSaveAndShare}
            disabled={isSaving}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-purple-900 to-brand-purple-800 hover:from-brand-purple-950 hover:to-brand-purple-900 text-white shadow-md shadow-brand-purple-900/15 border border-brand-purple-700 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 text-brand-gold-400 animate-spin" />
                <span>Persisting...</span>
              </>
            ) : savedShareUrl ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-brand-gold-400" />
                <span>Save & Share Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white text-brand-purple-950 border border-brand-slate-300 hover:border-brand-purple-400 shadow-sm transition-all"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-brand-purple-700" />
                <span>Copy Brief</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadTxt}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white text-brand-slate-700 border border-brand-slate-300 hover:bg-brand-slate-50 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download .txt</span>
          </button>

          <button
            onClick={handleOpenPrint}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-slate-900 hover:bg-black text-white shadow-md transition-all"
          >
            <Printer className="w-4 h-4 text-brand-gold-400" />
            <span>Print-Ready View</span>
          </button>
        </div>
      </div>

      {/* Refined Executive Card with 60% Opacity Aurora Glow Blobs */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-brand-slate-200/90 shadow-elevated mb-8 overflow-hidden">
        {/* 60% Opacity Aurora Glow Blobs */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none opacity-60" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none opacity-60" />
        <div className="absolute left-1/3 -top-20 w-72 h-72 rounded-full bg-blue-400/15 blur-3xl pointer-events-none opacity-60" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
          {/* Left: Venture Identity & Program Context */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-brand-purple-800 uppercase tracking-wider mb-2">
              <span>Target Grant:</span>
              <span className="text-brand-purple-950 font-semibold">{selectedGrant.name}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-brand-purple-950">
              {roadmap.startupName || 'Your Venture'}
            </h1>

            <p className="text-sm sm:text-base text-brand-slate-600 mt-2 max-w-2xl font-sans leading-relaxed">
              {roadmap.tagline || '12-week structured execution roadmap calibrated for committee approval.'}
            </p>

            {/* Clean Minimal Metadata Line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-xs sm:text-sm text-brand-slate-600 font-sans">
              <span>Funder: <strong className="text-brand-purple-950 font-semibold">{roadmap.funder}</strong></span>
              <span className="text-brand-slate-300">•</span>
              <span>Sector: <strong className="text-brand-purple-950 font-semibold">{roadmap.targetSector}</strong></span>
              <span className="text-brand-slate-300">•</span>
              <span>Jurisdiction: <strong className="text-brand-purple-950 font-semibold">{roadmap.targetRegion}</strong></span>
            </div>
          </div>

          {/* Right: Clean Requested Funding Box */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white/95 border border-brand-slate-200/90 shadow-sm lg:w-96 shrink-0 font-sans">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-slate-500 font-mono">
                Requested Capital
              </span>
              <span className="text-xs font-mono font-bold text-brand-purple-900 bg-brand-purple-50 px-2 py-0.5 rounded-md border border-brand-purple-100">
                Max: ${selectedGrant.max_amount_usd.toLocaleString()}
              </span>
            </div>

            <div className="flex items-baseline space-x-2 my-1">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-brand-purple-950 tracking-tight">
                ${requestedAmount.toLocaleString()}
              </span>
              <span className="text-xs font-mono font-bold text-brand-slate-500">USD</span>
            </div>

            {/* Interactive Capital Slider */}
            <div className="mt-3">
              <input
                type="range"
                min={Math.min(5000, selectedGrant.max_amount_usd)}
                max={selectedGrant.max_amount_usd}
                step={selectedGrant.max_amount_usd > 50000 ? 5000 : 1000}
                value={requestedAmount}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                className="w-full accent-brand-purple-800 cursor-pointer h-2 bg-brand-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-xs text-brand-slate-500 mt-2 font-mono">
                <span>Adjust grant ask</span>
                <span className="text-emerald-700 font-semibold">100% Non-dilutive</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Check Alert if text is vague or low clarity */}
      {(() => {
        const quality = assessInputQuality(roadmap.currentTractionBaseline, roadmap.fundingObjective);
        if (!quality.isVague) return null;
        return (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3 text-sm shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Draft Proposal Notice:</span>
              <span className="text-amber-800 font-normal">
                {quality.warning || 'Your stated traction baseline or goal lacks specific verifiable metrics. Review committees fund clarity and proof of execution. You can refine milestones below or update your diagnostic.'}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Clean Editorial Blocks with Soft Border-Left Accent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border-l-4 border-emerald-600 bg-slate-50 p-6 rounded-r-2xl shadow-sm">
          <div className="flex items-center space-x-2 mb-2 text-emerald-800">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
            <span className="text-sm font-bold font-sans">
              Stated Baseline (Already Completed)
            </span>
          </div>
          <p className="text-[15px] sm:text-base text-slate-700 leading-relaxed font-sans font-normal">
            {roadmap.currentTractionBaseline}
          </p>
        </div>

        <div className="border-l-4 border-purple-600 bg-slate-50 p-6 rounded-r-2xl shadow-sm">
          <div className="flex items-center space-x-2 mb-2 text-purple-900">
            <ShieldCheck className="w-5 h-5 text-brand-gold-500 shrink-0" />
            <span className="text-sm font-bold font-sans">
              Funding Objective (Target Milestone)
            </span>
          </div>
          <p className="text-[15px] sm:text-base text-slate-700 leading-relaxed font-sans font-normal">
            {roadmap.fundingObjective}
          </p>
        </div>
      </div>

      {/* Visual Budget Allocation Meter */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-slate-200 shadow-subtle mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-sm font-semibold text-brand-purple-950 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-brand-purple-800" />
              <span>Budget Distribution</span>
            </span>
            <span className="text-xs text-brand-slate-500 font-sans mt-0.5 block">
              Adjust allocation ratio based on your operational cash-flow needs or funder guidelines.
            </span>
          </div>

          {/* Ratio Preset Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold text-brand-slate-500 hidden sm:inline">Ratios:</span>
            <button
              onClick={() => {
                const t1 = Math.round(requestedAmount * 0.3);
                const t2 = Math.round(requestedAmount * 0.4);
                const t3 = requestedAmount - t1 - t2;
                const updated = roadmap.tranches.map((t) => {
                  if (t.id === 1) return { ...t, percentage: 30, amountUsd: t1 };
                  if (t.id === 2) return { ...t, percentage: 40, amountUsd: t2 };
                  if (t.id === 3) return { ...t, percentage: 30, amountUsd: t3 };
                  return t;
                });
                setRoadmap({ ...roadmap, tranches: updated });
                showToast('Applied 30 / 40 / 30 Standard ratio.');
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-brand-slate-100 hover:bg-brand-slate-200 text-brand-slate-700 transition-colors"
            >
              30/40/30 (Default)
            </button>

            <button
              onClick={() => {
                const t1 = Math.round(requestedAmount * 0.5);
                const t2 = Math.round(requestedAmount * 0.3);
                const t3 = requestedAmount - t1 - t2;
                const updated = roadmap.tranches.map((t) => {
                  if (t.id === 1) return { ...t, percentage: 50, amountUsd: t1 };
                  if (t.id === 2) return { ...t, percentage: 30, amountUsd: t2 };
                  if (t.id === 3) return { ...t, percentage: 20, amountUsd: t3 };
                  return t;
                });
                setRoadmap({ ...roadmap, tranches: updated });
                showToast('Applied 50 / 30 / 20 Front-loaded ratio.');
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-brand-slate-100 hover:bg-brand-slate-200 text-brand-slate-700 transition-colors"
            >
              50/30/20 (Upfront R&D)
            </button>

            <button
              onClick={() => {
                const t1 = Math.round(requestedAmount * 0.4);
                const t2 = Math.round(requestedAmount * 0.4);
                const t3 = requestedAmount - t1 - t2;
                const updated = roadmap.tranches.map((t) => {
                  if (t.id === 1) return { ...t, percentage: 40, amountUsd: t1 };
                  if (t.id === 2) return { ...t, percentage: 40, amountUsd: t2 };
                  if (t.id === 3) return { ...t, percentage: 20, amountUsd: t3 };
                  return t;
                });
                setRoadmap({ ...roadmap, tranches: updated });
                showToast('Applied 40 / 40 / 20 Balanced ratio.');
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-brand-slate-100 hover:bg-brand-slate-200 text-brand-slate-700 transition-colors"
            >
              40/40/20 (Balanced)
            </button>
          </div>
        </div>

        {/* Distribution Progress Bar */}
        <div className="h-5 w-full rounded-full bg-brand-slate-100 flex overflow-hidden p-0.5 border border-brand-slate-200">
          <div
            style={{ width: `${roadmap.tranches[0]?.percentage || 30}%` }}
            className="h-full bg-blue-500 rounded-l-full flex items-center justify-center text-xs font-mono font-bold text-white transition-all"
            title={`Tranche 1: ${roadmap.tranches[0]?.percentage || 30}%`}
          >
            {roadmap.tranches[0]?.percentage || 30}%
          </div>
          <div
            style={{ width: `${roadmap.tranches[1]?.percentage || 40}%` }}
            className="h-full bg-brand-purple-700 flex items-center justify-center text-xs font-mono font-bold text-white transition-all"
            title={`Tranche 2: ${roadmap.tranches[1]?.percentage || 40}%`}
          >
            {roadmap.tranches[1]?.percentage || 40}%
          </div>
          <div
            style={{ width: `${roadmap.tranches[2]?.percentage || 30}%` }}
            className="h-full bg-emerald-500 rounded-r-full flex items-center justify-center text-xs font-mono font-bold text-white transition-all"
            title={`Tranche 3: ${roadmap.tranches[2]?.percentage || 30}%`}
          >
            {roadmap.tranches[2]?.percentage || 30}%
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-center text-xs sm:text-sm">
          <div className="text-blue-900 font-semibold p-2.5 rounded-xl bg-blue-50 border border-blue-100">
            Tranche 1 ({roadmap.tranches[0]?.percentage}%): <strong className="font-bold font-mono">${roadmap.tranches[0]?.amountUsd.toLocaleString()}</strong>
          </div>
          <div className="text-brand-purple-900 font-semibold p-2.5 rounded-xl bg-brand-purple-50 border border-brand-purple-100">
            Tranche 2 ({roadmap.tranches[1]?.percentage}%): <strong className="font-bold font-mono">${roadmap.tranches[1]?.amountUsd.toLocaleString()}</strong>
          </div>
          <div className="text-emerald-900 font-semibold p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
            Tranche 3 ({roadmap.tranches[2]?.percentage}%): <strong className="font-bold font-mono">${roadmap.tranches[2]?.amountUsd.toLocaleString()}</strong>
          </div>
        </div>

        {/* Funder Policy & Alignment Advisory Note */}
        <div className="mt-4 pt-3 border-t border-brand-slate-100 text-xs text-brand-slate-500 flex items-start space-x-2 font-sans">
          <span className="font-bold text-brand-purple-900 shrink-0">💡 Committee Advisory:</span>
          <span>
            Tranche ratios represent recommended best practices for milestone gating. If {selectedGrant.funder} or {selectedGrant.name} stipulates a specific release schedule in their RFP guidelines, select the matching ratio above or customize individual deliverables below.
          </span>
        </div>
      </div>

      {/* 3 Tranches Cards */}
      <div className="space-y-6">
        {roadmap.tranches.map((tranche) => (
          <TrancheCard
            key={tranche.id}
            tranche={tranche}
            onUpdateTranche={handleUpdateTranche}
          />
        ))}
      </div>

      {/* Bottom Export Bar */}
      <div className="mt-10 p-8 sm:p-10 rounded-3xl bg-brand-slate-100 border border-brand-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-brand-purple-950 font-serif">
            Ready for Committee Submission?
          </h3>
          <p className="text-sm text-brand-slate-600 mt-1 leading-relaxed">
            Export the complete Markdown proposal or download the print-ready dossier for committee presentation.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleCopyMarkdown}
            className="px-5 py-3 rounded-xl bg-white hover:bg-brand-slate-50 text-brand-purple-950 border border-brand-slate-300 font-bold text-sm shadow-sm flex items-center space-x-2 transition-all"
          >
            <Copy className="w-4 h-4 text-brand-purple-800" />
            <span>{copied ? 'Copied Brief!' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleOpenPrint}
            className="px-6 py-3 rounded-xl bg-brand-purple-900 hover:bg-brand-purple-950 text-white font-bold text-sm shadow-md flex items-center space-x-2 transition-all"
          >
            <Printer className="w-4 h-4 text-brand-gold-400" />
            <span>Review & Print Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
