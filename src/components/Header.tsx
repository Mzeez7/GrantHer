import React from 'react';
import { Shield, Database } from 'lucide-react';

interface HeaderProps {
  currentStep?: number;
  onReset?: () => void;
  onHome?: () => void;
  onOpenLibrary: () => void;
  totalGrantsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onHome,
  onOpenLibrary,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-brand-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 py-3">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onHome || onReset}>
            <div className="w-10 h-10 rounded-xl bg-brand-purple-900 flex items-center justify-center shadow-md shadow-brand-purple-900/10 text-brand-gold-400 font-bold border border-brand-purple-800">
              <Shield className="w-5 h-5 text-brand-gold-400" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-brand-purple-950 font-sans">
                Grant<span className="text-brand-gold-500">Her</span>
              </span>
            </div>
          </div>

          {/* Right Action: Explore Grants */}
          <div className="flex items-center">
            <button
              onClick={onOpenLibrary}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-brand-purple-900 bg-brand-purple-50 hover:bg-brand-purple-100 border border-brand-purple-200 transition-colors shadow-sm"
              title="Explore all 100 grants in the curated database"
            >
              <Database className="w-4 h-4 text-brand-purple-700" />
              <span>Explore Grants</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
