import React, { useState, useMemo, useEffect } from 'react';
import { Grant, MatchedGrant } from '../types';
import { X, Search, Database, ExternalLink, ArrowRight } from 'lucide-react';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  grants: (Grant | MatchedGrant)[];
  onSelectGrant: (grant: any) => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  grants,
  onSelectGrant,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

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

  const categories = [
    'All',
    'Global Women-in-Tech',
    'Pan-African & Emerging Markets',
    'Web3 & Frontier Tech',
    'Multilateral & Climate',
  ];

  const filtered = useMemo(() => {
    return grants.filter((g) => {
      const matchesSearch =
        search === '' ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.funder.toLowerCase().includes(search.toLowerCase()) ||
        g.eligible_regions.some((r) => r.toLowerCase().includes(search.toLowerCase())) ||
        g.target_sectors.some((s) => s.toLowerCase().includes(search.toLowerCase()));

      const matchesCat = category === 'All' || g.category === category;
      return matchesSearch && matchesCat;
    });
  }, [grants, search, category]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-brand-purple-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border border-brand-slate-200 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-brand-slate-200 flex items-center justify-between bg-brand-slate-50">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-purple-900 flex items-center justify-center text-brand-gold-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 id="library-modal-title" className="text-lg sm:text-xl font-bold text-brand-purple-950 font-serif">
                Curated 100 Verified Non-Dilutive Grants Library
              </h3>
              <p className="text-xs sm:text-sm text-brand-slate-500 mt-0.5 font-medium">
                100% Non-dilutive capital directory spanning 5 continents and deep tech
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-brand-slate-200 text-brand-slate-500 hover:text-brand-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-5 sm:p-6 border-b border-brand-slate-200 bg-white space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-brand-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by grant name, funder, country, or sector..."
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-brand-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-purple-800 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  category === cat
                    ? 'bg-brand-purple-900 text-white shadow-sm'
                    : 'bg-brand-slate-100 text-brand-slate-600 hover:bg-brand-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 divide-y divide-brand-slate-100 space-y-4">
          {filtered.map((g) => {
            const hasScore = 'matchScore' in g;
            return (
              <div
                key={g.id}
                className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-slate-50/80 p-4 rounded-2xl transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-brand-purple-950">
                      {g.name}
                    </span>
                    <span className="text-xs font-semibold text-brand-purple-800 bg-brand-purple-50 px-2.5 py-0.5 rounded-md border border-brand-purple-100 font-mono">
                      {g.category}
                    </span>
                    <span className="text-xs text-brand-slate-500 font-medium font-mono">
                      {g.cycle_status}
                    </span>
                    {hasScore && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-mono">
                        {(g as MatchedGrant).matchScore}% Fit
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-brand-slate-500 font-sans">
                    Funder: <strong className="text-brand-slate-700">{g.funder}</strong> • Ceiling:{' '}
                    <strong className="text-brand-purple-900 font-mono font-bold">${g.max_amount_usd.toLocaleString()} USD</strong> • Stage:{' '}
                    <span className="font-medium text-brand-slate-700">{g.target_stage}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-brand-slate-600 leading-relaxed line-clamp-2">
                    {g.synopsis}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <a
                    href={g.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 text-xs font-semibold text-brand-slate-600 hover:text-brand-purple-900 hover:bg-brand-slate-100 rounded-xl transition-colors"
                    title="External Application Portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => {
                      onSelectGrant(g);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-purple-900 hover:bg-brand-purple-950 text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                  >
                    <span>Build Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-gold-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-brand-slate-200 bg-brand-slate-50 flex items-center justify-between text-xs sm:text-sm text-brand-slate-500 font-medium">
          <span className="font-mono">Showing {filtered.length} of {grants.length} grants</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-brand-slate-300 font-bold text-brand-slate-700 hover:bg-brand-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
