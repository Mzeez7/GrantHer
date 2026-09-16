import React, { useState, useMemo, useEffect } from 'react';
import { Grant, MatchedGrant } from '../types';
import { GrantCard } from './GrantCard';
import { ArrowLeft, Search, Database, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface ExploreGrantsProps {
  grants: (Grant | MatchedGrant)[];
  onSelectGrant: (grant: any) => void;
  onBackToHome: () => void;
  onStartDiagnostic: () => void;
}

const ITEMS_PER_PAGE = 12;

export const ExploreGrants: React.FC<ExploreGrantsProps> = ({
  grants,
  onSelectGrant,
  onBackToHome,
  onStartDiagnostic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedRegion, selectedSector]);

  const categories = [
    'All',
    'Global Women-in-Tech',
    'Pan-African & Emerging Markets',
    'Web3 & Frontier Tech',
    'Multilateral & Climate',
  ];

  const regions = [
    'All',
    'Sub-Saharan Africa',
    'Global',
    'North America',
    'Europe',
    'Latin America',
    'MENA',
    'South Asia',
    'Southeast Asia',
  ];

  const sectors = [
    'All',
    'Healthtech',
    'Fintech',
    'AI / Agentic',
    'Climate',
    'Agritech',
    'Edtech',
    'Web3 / Crypto',
    'Supply Chain',
    'B2B SaaS',
    'GovTech / Civic',
  ];

  const filteredGrants = useMemo(() => {
    return grants.filter((g) => {
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

      const matchesSec =
        selectedSector === 'All' ||
        g.target_sectors.some((s) => s.toLowerCase().includes(selectedSector.toLowerCase()));

      return matchesSearch && matchesCat && matchesReg && matchesSec;
    });
  }, [grants, searchQuery, selectedCategory, selectedRegion, selectedSector]);

  const totalPages = Math.ceil(filteredGrants.length / ITEMS_PER_PAGE);
  const paginatedGrants = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGrants.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGrants, currentPage]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Navigation Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-brand-slate-600 hover:text-brand-purple-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={onStartDiagnostic}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-brand-gold-400 hover:bg-brand-gold-500 text-brand-purple-950 text-xs font-bold tracking-tight shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4 text-brand-purple-950" />
          <span>Match My Startup in 5 Minutes</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-10 text-left">
        <div className="flex items-center space-x-2 text-brand-purple-900 font-mono text-xs font-semibold mb-2">
          <Database className="w-4 h-4 text-brand-purple-700" />
          <span>DIRECTORY OF 100 VERIFIED NON-DILUTIVE FUNDS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-semibold text-brand-purple-950 tracking-tight">
          Explore Grants
        </h1>
        <p className="mt-3 text-base sm:text-lg text-brand-slate-600 max-w-3xl font-sans leading-relaxed">
          Browse and filter equity-free grant opportunities across global women-in-tech, pan-African innovation, climate, and frontier technology tracks.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-slate-200 shadow-subtle mb-10 space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-brand-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by grant name, funder, country, or sector..."
            className="w-full pl-12 pr-4 py-3.5 text-base rounded-2xl border border-brand-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-purple-800 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-slate-400 hover:text-brand-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-slate-500 mb-2 font-mono">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-purple-900 text-white shadow-sm ring-2 ring-brand-purple-200'
                    : 'bg-brand-slate-100 text-brand-slate-700 hover:bg-brand-slate-200 border border-brand-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Region & Sector Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-brand-slate-100">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-slate-500 mb-2 font-mono">
              Operating Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border border-brand-slate-300 bg-brand-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-800 font-sans font-medium"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r === 'All' ? 'All Regions (Global)' : r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-slate-500 mb-2 font-mono">
              Industry Sector
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border border-brand-slate-300 bg-brand-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-800 font-sans font-medium"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Industry Sectors' : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-brand-slate-500 pt-2 font-mono">
          <span>Showing {filteredGrants.length} matching grant programs</span>
          {(searchQuery || selectedCategory !== 'All' || selectedRegion !== 'All' || selectedSector !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedRegion('All');
                setSelectedSector('All');
              }}
              className="text-brand-purple-800 hover:underline font-bold"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Grant Cards Grid */}
      {paginatedGrants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedGrants.map((grant) => {
            // Ensure grant is formatted with required matched fields
            const matchedGrant: MatchedGrant = 'matchScore' in grant ? (grant as MatchedGrant) : {
              ...grant,
              matchScore: 90,
              matchedCriteria: [
                `Eligible for ${grant.target_stage}`,
                `Mandate: ${grant.target_sectors.slice(0, 2).join(', ')}`,
                `Jurisdiction: ${grant.eligible_regions.join(', ')}`,
              ],
              blindspotAlert: grant.blindspot_warning || 'Ensure audited statements and registration documents are prepared.',
            };

            return (
              <GrantCard
                key={grant.id}
                grant={matchedGrant}
                onSelect={onSelectGrant}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-brand-slate-200 p-8">
          <Database className="w-12 h-12 text-brand-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-brand-purple-950 font-serif">
            No matching grants found
          </h3>
          <p className="text-sm text-brand-slate-500 mt-2 max-w-md mx-auto font-sans">
            Try adjusting your search query, sector, or region filters to discover available funding programs.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedRegion('All');
              setSelectedSector('All');
            }}
            className="mt-6 px-6 py-2.5 rounded-full bg-brand-purple-900 text-white text-xs font-bold hover:bg-brand-purple-950 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-between border-t border-brand-slate-200 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2.5 rounded-xl border border-brand-slate-300 text-xs font-bold text-brand-slate-700 hover:bg-brand-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center space-x-1.5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono font-semibold text-brand-slate-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2.5 rounded-xl border border-brand-slate-300 text-xs font-bold text-brand-slate-700 hover:bg-brand-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center space-x-1.5 transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
