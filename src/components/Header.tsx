import React from 'react';
import { Database } from 'lucide-react';

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
        <div className="flex items-center justify-between h-18 py-2.5 sm:py-3">
          {/* Brand Logo */}
          <div className="flex items-center cursor-pointer" onClick={onHome || onReset}>
            <img
              src="/logo.png"
              alt="GrantHer — Empowering Women. Securing Futures."
              className="h-10 sm:h-11 w-auto object-contain hover:opacity-95 transition-opacity"
            />
          </div>

          {/* Right Action: Explore Grants */}
          <div className="flex items-center">
            <button
              onClick={onOpenLibrary}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-brand-purple-900 bg-brand-purple-50 hover:bg-brand-purple-100 border border-brand-purple-200 transition-colors shadow-sm"
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
