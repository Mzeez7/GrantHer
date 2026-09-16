import React, { useState } from 'react';
import { Tranche, Deliverable } from '../types';
import { Edit3, Check, Plus, Trash2, ShieldCheck, FileCheck, Layers, Copy, CheckCircle } from 'lucide-react';

interface TrancheCardProps {
  tranche: Tranche;
  onUpdateTranche: (updatedTranche: Tranche) => void;
}

export const TrancheCard: React.FC<TrancheCardProps> = ({ tranche, onUpdateTranche }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editEvidence, setEditEvidence] = useState('');
  const [copied, setCopied] = useState(false);

  // Tranche theme accents
  const getBadgeColor = () => {
    switch (tranche.id) {
      case 1:
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 2:
        return 'bg-brand-purple-50 text-brand-purple-900 border-brand-purple-200';
      case 3:
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const handleStartEdit = (d: Deliverable) => {
    setEditingId(d.id);
    setEditTitle(d.title);
    setEditDesc(d.description);
    setEditEvidence(d.verificationEvidence);
  };

  const handleSaveEdit = (dId: string) => {
    const updatedDeliverables = tranche.deliverables.map((d) => {
      if (d.id === dId) {
        return {
          ...d,
          title: editTitle.trim() || d.title,
          description: editDesc.trim() || d.description,
          verificationEvidence: editEvidence.trim() || d.verificationEvidence,
        };
      }
      return d;
    });

    onUpdateTranche({
      ...tranche,
      deliverables: updatedDeliverables,
    });
    setEditingId(null);
  };

  const handleDeleteDeliverable = (dId: string) => {
    if (tranche.deliverables.length <= 1) {
      alert('A tranche must have at least one deliverable.');
      return;
    }
    const updatedDeliverables = tranche.deliverables.filter((d) => d.id !== dId);
    onUpdateTranche({
      ...tranche,
      deliverables: updatedDeliverables,
    });
  };

  const handleAddDeliverable = () => {
    const newId = `del-${tranche.id}-${Date.now()}`;
    const newDeliverable: Deliverable = {
      id: newId,
      title: 'New Milestone Deliverable',
      description: 'Define specific operational task or architecture build for committee review.',
      verificationEvidence: 'Verification data, staging audit sign-off, or partner attestation memo.',
    };

    onUpdateTranche({
      ...tranche,
      deliverables: [...tranche.deliverables, newDeliverable],
    });

    handleStartEdit(newDeliverable);
  };

  const handleCopySingleTranche = async () => {
    const textLines = [
      `### Tranche ${tranche.id}: ${tranche.name} (${tranche.timeline})`,
      `Allocation: $${tranche.amountUsd.toLocaleString()} USD (${tranche.percentage}% of Total Ask)`,
      `Phase Objective: ${tranche.phaseObjective}`,
      '',
      'Deliverables & Verification Metrics:',
      ...tranche.deliverables.map(
        (d, i) =>
          `${i + 1}. ${d.title}\n   - Details: ${d.description}\n   - Metric: ${d.verificationEvidence}`
      ),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(textLines);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-slate-200 shadow-subtle overflow-hidden transition-all hover:shadow-elevated">
      {/* Tranche Header */}
      <div className="p-6 sm:p-8 border-b border-brand-slate-100 bg-brand-slate-50/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold border flex items-center space-x-2 ${getBadgeColor()}`}
            >
              <Layers className="w-4 h-4" />
              <span>
                Tranche {tranche.id}: {tranche.name}
              </span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-brand-slate-500 font-mono">
              {tranche.timeline}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-left sm:text-right mr-2">
              <span className="text-xs font-semibold text-brand-slate-500 block font-sans">
                Tranche Allocation
              </span>
              <span className="text-lg sm:text-xl font-bold text-brand-purple-950 font-mono">
                ${tranche.amountUsd.toLocaleString()}{' '}
                <span className="text-xs sm:text-sm font-medium text-brand-slate-500">
                  ({tranche.percentage}%)
                </span>
              </span>
            </div>

            <button
              onClick={handleCopySingleTranche}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-brand-slate-300 bg-white hover:bg-brand-slate-50 text-xs font-bold text-brand-slate-700 transition-colors shadow-sm"
              title="Copy this single tranche for Word or Docs"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-brand-slate-500" />
                  <span>Copy Tranche</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-sm sm:text-[15px] text-brand-slate-600 mt-3 font-normal leading-relaxed">
          <span className="font-bold text-brand-slate-800">Phase Objective:</span>{' '}
          {tranche.phaseObjective}
        </p>
      </div>

      {/* Deliverables List */}
      <div className="p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-brand-purple-950 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-purple-800" />
            <span>Deliverables & Verification Metrics</span>
          </span>
          <button
            onClick={handleAddDeliverable}
            className="inline-flex items-center space-x-1.5 text-sm font-bold text-brand-purple-800 hover:text-brand-purple-950 hover:underline"
          >
            <Plus className="w-4 h-4" />
            <span>Add Deliverable</span>
          </button>
        </div>

        <div className="space-y-4">
          {tranche.deliverables.map((del, idx) => {
            const isEditing = editingId === del.id;

            if (isEditing) {
              return (
                <div
                  key={del.id}
                  className="p-6 rounded-2xl border border-brand-purple-300 bg-brand-purple-50/30 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-brand-purple-900">
                      Editing Deliverable {tranche.id}.{idx + 1}
                    </span>
                    <button
                      onClick={() => handleSaveEdit(del.id)}
                      className="px-4 py-1.5 rounded-lg bg-brand-purple-900 text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-sm hover:bg-brand-purple-950 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-slate-700 mb-1.5">
                      Deliverable Title:
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-xl border border-brand-slate-300 bg-white focus:ring-2 focus:ring-brand-purple-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-slate-700 mb-1.5">
                      Operational Description:
                    </label>
                    <textarea
                      rows={2}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-xl border border-brand-slate-300 bg-white focus:ring-2 focus:ring-brand-purple-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-900 mb-1.5">
                      Metric (Proof Required to Unlock Capital):
                    </label>
                    <textarea
                      rows={2}
                      value={editEvidence}
                      onChange={(e) => setEditEvidence(e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-xl border border-emerald-300 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-600 text-emerald-950 font-medium focus:outline-none"
                    />
                  </div>
                </div>
              );
            }

            return (
              <div
                key={del.id}
                className="group p-5 sm:p-6 rounded-2xl border border-brand-slate-200 bg-white hover:border-brand-purple-300 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <span className="w-6 h-6 rounded-full bg-brand-purple-100 text-brand-purple-900 font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-brand-purple-950">
                        {del.title}
                      </h4>
                      <p className="text-sm text-brand-slate-600 mt-1.5 leading-relaxed">
                        {del.description}
                      </p>
                    </div>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center space-x-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(del)}
                      className="p-2 rounded-lg hover:bg-brand-slate-100 text-brand-slate-500 hover:text-brand-purple-900 transition-colors"
                      title="Edit deliverable"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDeliverable(del.id)}
                      className="p-2 rounded-lg hover:bg-rose-50 text-brand-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete deliverable"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Verification Metric Box */}
                <div className="mt-4 pt-3.5 border-t border-brand-slate-100 flex items-start space-x-2.5 text-xs sm:text-sm bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/70">
                  <FileCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-900">
                      Metric:
                    </span>{' '}
                    <span className="text-emerald-950 font-medium font-sans text-xs sm:text-sm">
                      {del.verificationEvidence}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
