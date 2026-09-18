import React, { useEffect } from 'react';
import { X, Printer, Download, Copy, Shield, FileText } from 'lucide-react';
import { CommitteeRoadmap } from '../types';
import { copyToClipboard, downloadFile } from '../lib/exportUtils';
import { fireCelebration } from '../lib/celebration';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdownContent: string;
  roadmap: CommitteeRoadmap | null;
  startupName: string;
  grantName: string;
  showToast: (msg: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  markdownContent,
  roadmap,
  startupName,
  grantName,
  showToast,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyToClipboard(markdownContent);
    if (success) {
      fireCelebration();
      showToast('Copied proposal brief to clipboard as formatted Markdown!');
    }
  };

  const handleDownload = () => {
    const filename = `${startupName.toLowerCase().replace(/\s+/g, '_')}_proposal_brief.txt`;
    downloadFile(filename, markdownContent);
    fireCelebration();
    showToast(`Downloaded ${filename}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-brand-purple-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-slate-100 rounded-3xl border border-brand-slate-300 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-brand-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-purple-900 flex items-center justify-center text-brand-gold-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 id="export-modal-title" className="text-base sm:text-lg font-bold text-brand-purple-950 font-serif">
                Publication-Ready Executive Brief
              </h3>
              <p className="text-xs text-brand-slate-500 font-medium">
                {startupName} • Target Fund: {grantName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl border border-brand-slate-300 text-brand-slate-700 hover:bg-brand-slate-100 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
              title="Print Document (or save as PDF)"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-brand-slate-200 text-brand-slate-500 hover:text-brand-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Formal Publication-Ready Executive Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {/* Formatted Printed Executive Brief Sheet */}
          <div className="bg-white shadow-xl border border-slate-200 rounded-xl p-8 sm:p-12 max-w-3xl mx-auto font-sans text-slate-800 leading-relaxed print:shadow-none print:border-none print:p-0">
            {/* Document Header */}
            <div className="border-b border-slate-200 pb-5 mb-6">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-brand-purple-800 font-bold">
                  Grant Proposal & Committee Milestone Roadmap
                </span>
                <span className="text-xs font-mono text-slate-400 font-medium">
                  {dateStr}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                {roadmap?.startupName || startupName}
              </h1>
              <p className="text-sm text-slate-600 mt-1.5 font-normal">
                {roadmap?.tagline}
              </p>
            </div>

            {/* Target Program Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-8 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 font-medium block">Target Grant Program:</span>
                <strong className="text-slate-900 font-semibold">{roadmap?.grantName || grantName}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Funder Entity:</span>
                <strong className="text-slate-900 font-semibold">{roadmap?.funder || 'Multilateral Grant Agency'}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Requested Capital:</span>
                <strong className="text-purple-900 font-mono font-bold">
                  ${roadmap?.totalGrantUsd.toLocaleString()} USD (100% Non-dilutive)
                </strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Execution Horizon:</span>
                <strong className="text-slate-900 font-mono font-semibold">
                  {roadmap?.timelineWeeks || 12} Weeks (3 Tranche Release Gates)
                </strong>
              </div>
            </div>

            {/* Section 1: Executive Venture Overview */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-purple-950 border-b border-slate-200 pb-2 mb-4 font-serif">
                1. Executive Venture Overview
              </h2>

              <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm mb-4">
                <div>
                  <span className="text-slate-500 block">Operating Sector:</span>
                  <span className="font-semibold text-slate-900">{roadmap?.targetSector}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Jurisdiction / Region:</span>
                  <span className="font-semibold text-slate-900">{roadmap?.targetRegion}</span>
                </div>
              </div>

              {/* Stated Baseline */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border-l-4 border-emerald-600">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-1 font-mono">
                  Stated Baseline & Historical Traction (Already Validated)
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {roadmap?.currentTractionBaseline}
                </p>
              </div>

              {/* Funding Objective */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border-l-4 border-purple-600">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900 block mb-1 font-mono">
                  Funding Milestone Objective (Target of This Grant)
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {roadmap?.fundingObjective}
                </p>
              </div>
            </div>

            {/* Section 2: Capital Tranche Allocation & Milestone Gates */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-purple-950 border-b border-slate-200 pb-2 mb-4 font-serif">
                2. Capital Tranche Allocation & Milestone Gates
              </h2>

              <div className="space-y-6">
                {roadmap?.tranches.map((tranche) => (
                  <div key={tranche.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 tranche-block print-avoid-break">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base font-serif">
                        Tranche {tranche.id}: {tranche.name}
                      </h3>
                      <span className="font-mono text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-1 rounded-md">
                        ${tranche.amountUsd.toLocaleString()} USD ({tranche.percentage}% of ask) • {tranche.timeline}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 mb-3 font-normal">
                      <strong className="text-slate-800">Phase Objective:</strong> {tranche.phaseObjective}
                    </p>

                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block font-mono">
                        Deliverables & Attestation Evidence:
                      </span>
                      <ul className="space-y-2.5">
                        {tranche.deliverables.map((d, i) => (
                          <li key={d.id} className="text-xs sm:text-sm pl-4 border-l-2 border-purple-300">
                            <span className="font-bold text-slate-900 block">
                              Deliverable {tranche.id}.{i + 1}: {d.title}
                            </span>
                            <span className="text-slate-600 block mt-0.5">
                              {d.description}
                            </span>
                            <span className="text-xs font-mono text-emerald-800 italic block mt-1">
                              Proof for Committee: {d.verificationEvidence}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Committee Governance & Attestation Notice */}
            <div className="print-avoid-break">
              <h2 className="text-lg font-bold text-purple-950 border-b border-slate-200 pb-2 mb-3 font-serif">
                3. Committee Governance & Attestation Notice
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 font-sans">
                <li>Funds disbursed are strictly 100% non-dilutive and allocated against verified evidence packets.</li>
                <li>Each milestone gate requires committee ratification of submitted verification proofs prior to subsequent tranche release.</li>
                <li>Prepared with GrantHer Institutional Grant Capital & Committee Roadmap Engine.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Action Bar (Anchored Cleanly at Bottom) */}
        <div className="p-4 sm:p-6 border-t border-brand-slate-300 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-brand-slate-500">
            <Shield className="w-4 h-4 text-brand-purple-800" />
            <span>Ready for committee submission & board presentation</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-brand-slate-300 bg-white hover:bg-brand-slate-100 text-brand-purple-950 font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <Copy className="w-4 h-4 text-brand-purple-800" />
              <span>Copy Markdown</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-brand-slate-300 bg-white hover:bg-brand-slate-100 text-brand-slate-700 font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download .txt</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-brand-purple-900 hover:bg-brand-purple-950 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Printer className="w-4 h-4 text-brand-gold-400" />
              <span>Download PDF / Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

