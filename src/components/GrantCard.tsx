import React from 'react';
import { MatchedGrant } from '../types';
import { Check, AlertCircle, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';

interface GrantCardProps {
  grant: MatchedGrant;
  isSelected?: boolean;
  onSelect: (grant: MatchedGrant) => void;
  rank?: number;
}

export const GrantCard: React.FC<GrantCardProps> = ({
  grant,
  isSelected = false,
  onSelect,
  rank,
}) => {
  return (
    <div
      className={`rounded-3xl bg-white border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
        isSelected
          ? 'border-brand-purple-900 shadow-xl ring-2 ring-brand-purple-700'
          : 'border-brand-slate-200/90 shadow-sm hover:shadow-md hover:border-brand-purple-300'
      }`}
    >
      {/* Top Banner with Rank, Category and Match Score */}
      <div className="p-6 sm:p-7 pb-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {rank !== undefined && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-brand-purple-950 text-white font-bold text-xs font-mono">
                #{rank}
              </span>
            )}
            <span className="text-xs font-medium text-brand-slate-600 bg-brand-slate-100 px-2.5 py-1 rounded-lg border border-brand-slate-200">
              {grant.category}
            </span>
          </div>

          {/* Fit Score Badge */}
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs font-sans shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span><strong className="font-mono">{grant.matchScore}%</strong> Fit</span>
          </div>
        </div>

        {/* Grant Title & Funder */}
        <div className="mb-5">
          <h3 className="text-xl sm:text-2xl font-serif font-semibold text-brand-purple-950 tracking-tight leading-snug">
            {grant.name}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-brand-purple-800 mt-1 font-sans">
            Funder: {grant.funder}
          </p>
          <p className="text-sm text-brand-slate-600 mt-2.5 line-clamp-2 font-sans leading-relaxed">
            {grant.synopsis}
          </p>
        </div>

        {/* Financial Ceiling & Timeline Metrics */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-brand-slate-50 border border-brand-slate-200/80 mb-5">
          <div>
            <span className="text-xs font-semibold text-brand-slate-500 block font-sans">
              Max Grant
            </span>
            <span className="text-lg font-mono font-bold text-brand-slate-900 mt-0.5 block">
              ${grant.max_amount_usd.toLocaleString()} <span className="text-xs font-sans font-normal text-brand-slate-500">USD</span>
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-brand-slate-500 block font-sans">
              Timeline
            </span>
            <span className="text-sm sm:text-base font-mono font-semibold text-brand-slate-800 mt-0.5 block">
              {grant.typical_turnaround}
            </span>
          </div>
        </div>

        {/* Matched Criteria Checkmarks */}
        <div className="space-y-2 mb-5">
          {grant.matchedCriteria.map((criterion, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-brand-slate-700">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{criterion}</span>
            </div>
          ))}
        </div>

        {/* Prerequisite / Eligibility Notice */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border-l-4 border-brand-purple-700 text-xs text-brand-slate-700">
          <div className="flex items-center space-x-1.5 font-bold text-brand-purple-950 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-brand-purple-700 shrink-0" />
            <span>Key Requirement Notice</span>
          </div>
          <p className="leading-relaxed font-sans text-brand-slate-600">
            {grant.blindspotAlert}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-6 sm:p-7 pt-4 bg-brand-slate-50 border-t border-brand-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <a
          href={grant.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center space-x-1.5 text-xs sm:text-sm font-semibold text-brand-slate-700 hover:text-brand-purple-950 px-3.5 py-2.5 rounded-xl border border-brand-slate-300 hover:bg-white transition-colors"
          title="Visit the funder's official website and application guidelines"
        >
          <span>Official Grant Page</span>
          <ExternalLink className="w-3.5 h-3.5 text-brand-purple-700" />
        </a>

        <button
          onClick={() => onSelect(grant)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-purple-900 hover:bg-brand-purple-950 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-sm transition-all group"
        >
          <span>Build Roadmap</span>
          <ArrowRight className="w-4 h-4 text-brand-gold-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
