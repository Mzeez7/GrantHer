import React from 'react';
import { Check, ClipboardList, Target, FileSpreadsheet } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  onNavigateToStep?: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onNavigateToStep }) => {
  const steps = [
    { number: 1, title: 'Diagnostic Intake', subtitle: 'Baseline & Scope', icon: ClipboardList },
    { number: 2, title: 'Opportunity Matching', subtitle: 'Fit & Blindspots', icon: Target },
    { number: 3, title: 'Committee Board', subtitle: '3-Tranche Release', icon: FileSpreadsheet },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className="relative flex items-center justify-between">
        {/* Connecting progress background line */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-brand-slate-200 z-0" />
        
        {/* Active progress fill line */}
        <div
          className="absolute left-8 top-1/2 -translate-y-1/2 h-0.5 bg-brand-purple-800 transition-all duration-500 z-0"
          style={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : 'calc(100% - 4rem)',
          }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isClickable = isCompleted && onNavigateToStep;
          const Icon = step.icon;

          return (
            <div
              key={step.number}
              onClick={() => isClickable && onNavigateToStep(step.number)}
              className={`relative z-10 flex flex-col items-center group ${
                isClickable ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                  isCompleted
                    ? 'bg-brand-purple-900 border-brand-purple-900 text-brand-gold-400 shadow-sm'
                    : isActive
                    ? 'bg-white border-brand-purple-800 text-brand-purple-900 shadow-md ring-4 ring-brand-purple-100'
                    : 'bg-white border-brand-slate-300 text-brand-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-5 h-5" />}
              </div>

              <div className="mt-2.5 text-center">
                <span
                  className={`text-xs sm:text-sm font-bold block transition-colors ${
                    isActive
                      ? 'text-brand-purple-950'
                      : isCompleted
                      ? 'text-brand-slate-700'
                      : 'text-brand-slate-400'
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-xs text-brand-slate-500 hidden sm:block mt-0.5">
                  {step.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
