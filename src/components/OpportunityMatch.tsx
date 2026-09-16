import React, { useState, useMemo, useEffect } from 'react';
import { DiagnosticInput, MatchedGrant } from '../types';
import { GrantCard } from './GrantCard';
import { ArrowLeft, Search, Filter, Database, ChevronRight, ChevronLeft, X, Globe, ChevronDown } from 'lucide-react';

interface OpportunityMatchProps {
  input: DiagnosticInput;
  topMatches: MatchedGrant[];
  allEvaluatedGrants: MatchedGrant[];
  onSelectGrant: (grant: MatchedGrant) => void;
  onBackToDiagnostic: () => void;
}

const ITEMS_PER_PAGE = 12;

export const OpportunityMatch: React.FC<OpportunityMatchProps> = ({
  input,
  topMatches,
  allEvaluatedGrants,
  onSelectGrant,
  onBackToDiagnostic,
}) => {
  const [activeTab, setActiveTab] = useState<'top3' | 'library'>('top3');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedRegion]);

  // Filter 100 grants library
  const filteredLibrary = useMemo(() => {
    return allEvaluatedGrants.filter((g) => {
      const matchesSearch =
        searchQuery === '' ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.funder.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.synopsis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.target_sectors.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        g.eligible_regions.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || g.category === selectedCategory;
      const matchesReg =
        selectedRegion === 'All' ||
        g.eligible_regions.includes(selectedRegion) ||
        g.eligible_regions.includes('Global');

      return matchesSearch && matchesCat && matchesReg;
    });
  }, [allEvaluatedGrants, searchQuery, selectedCategory, selectedRegion]);

  // Paginated items
  const totalPages = Math.ceil(filteredLibrary.length / ITEMS_PER_PAGE);
  const paginatedGrants = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLibrary.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLibrary, currentPage]);

  const categories = [
    'All',
    'Global Women-in-Tech',
    'Pan-African & Emerging Markets',
    'Web3 & Frontier Tech',
    'Multilateral & Climate',
  ];

  const regions = [
    'All Regions / Global',
    'Sub-Saharan Africa',
    'Latin America',
    'North America',
    'Europe',
    'MENA',
    'South Asia',
    'Southeast Asia',
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pt-2">
        <div>
          <button
            onClick={onBackToDiagnostic}
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-brand-slate-500 hover:text-brand-purple-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Edit Diagnostic</span>
          </button>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-semibold text-brand-purple-950 tracking-tight">
            {input.startupName ? `Grant Matches for ${input.startupName}` : 'Your Top Grant Matches'}
          </h1>
          
          <p className="text-sm text-brand-slate-600 mt-1.5 font-sans">
            Select a grant to generate your customized 12-week roadmap and committee brief.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-brand-slate-100 rounded-xl border border-brand-slate-200 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('top3')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'top3'
                ? 'bg-brand-purple-900 text-white shadow-sm'
                : 'text-brand-slate-600 hover:text-brand-purple-950'
            }`}
          >
            Top Matches ({topMatches.length})
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'library'
                ? 'bg-brand-purple-900 text-white shadow-sm'
                : 'text-brand-slate-600 hover:text-brand-purple-950'
            }`}
          >
            All 100 Grants
          </button>
        </div>
      </div>

      {/* Tab 1: Top 3 Matched Grants */}
      {activeTab === 'top3' && (
        <div className="animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {topMatches.map((grant, index) => (
              <GrantCard
                key={grant.id}
                grant={grant}
                rank={index + 1}
                onSelect={onSelectGrant}
              />
            ))}
          </div>

          {/* Quick Callout to explore remaining 97 grants */}
          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-white border border-brand-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-purple-50 border border-brand-purple-200 flex items-center justify-center text-brand-purple-800 shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-brand-purple-950">
                  Looking for additional opportunities?
                </h4>
                <p className="text-sm text-brand-slate-600 mt-0.5 leading-relaxed">
                  You have 97 other non-dilutive grant funds across Africa, Latin America, Europe, and Web3 ecosystems.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('library')}
              className="px-5 py-3 rounded-xl bg-brand-slate-100 hover:bg-brand-purple-50 text-brand-purple-900 border border-brand-slate-300 font-bold text-xs sm:text-sm flex items-center space-x-2 transition-colors shrink-0"
            >
              <span>Explore All 100 Grants</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: All 100 Grants Search & Library */}
      {activeTab === 'library' && (
        <div className="animate-in fade-in duration-200">
          {/* Filter and Search Bar */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-slate-200 shadow-subtle mb-8 space-y-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-brand-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 100 grants by name, funder, country (e.g. Kenya, Nigeria), or keyword..."
                  className="w-full pl-10 pr-10 py-3 text-sm sm:text-base rounded-xl border border-brand-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-purple-800 font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-slate-400 hover:text-brand-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Styled Region Quick Select */}
              <div className="sm:w-72 relative">
                <div className="relative">
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full py-3 pl-10 pr-10 text-sm sm:text-base rounded-xl border border-brand-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple-800 font-medium appearance-none cursor-pointer"
                  >
                    {regions.map((r) => (
                      <option key={r} value={r === 'All Regions / Global' ? 'All' : r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <Globe className="w-4 h-4 text-brand-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <ChevronDown className="w-4 h-4 text-brand-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-slate-100">
              <span className="text-xs font-semibold text-brand-slate-500 mr-2 flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>Sector Focus:</span>
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-purple-900 text-white shadow-sm'
                      : 'bg-brand-slate-100 text-brand-slate-600 hover:bg-brand-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          {filteredLibrary.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-brand-slate-200 p-10">
              <Database className="w-10 h-10 text-brand-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-brand-slate-800">No grants match your filter</h3>
              <p className="text-sm text-brand-slate-500 mt-1.5">
                Try clearing your search query or switching the category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedRegion('All');
                }}
                className="mt-5 px-5 py-2.5 rounded-xl bg-brand-purple-900 text-white text-sm font-bold shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedGrants.map((grant) => (
                  <GrantCard
                    key={grant.id}
                    grant={grant}
                    onSelect={onSelectGrant}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 sm:p-6 bg-white rounded-2xl border border-brand-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs sm:text-sm text-brand-slate-500 font-medium">
                    Showing <strong className="text-brand-purple-950 font-mono">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong>–<strong className="text-brand-purple-950 font-mono">{Math.min(currentPage * ITEMS_PER_PAGE, filteredLibrary.length)}</strong> of <strong className="text-brand-purple-950 font-mono">{filteredLibrary.length}</strong> grants
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2.5 rounded-xl border border-brand-slate-200 text-brand-slate-700 hover:bg-brand-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1 text-xs font-semibold"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center space-x-1 px-2 font-mono text-xs font-semibold">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            currentPage === pageNum
                              ? 'bg-brand-purple-900 text-white font-bold'
                              : 'text-brand-slate-600 hover:bg-brand-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2.5 rounded-xl border border-brand-slate-200 text-brand-slate-700 hover:bg-brand-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1 text-xs font-semibold"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
