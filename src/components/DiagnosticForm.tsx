import React, { useState } from 'react';
import { DiagnosticInput, Stage } from '../types';
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Cpu,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface DiagnosticFormProps {
  initialValues: DiagnosticInput;
  onSubmit: (values: DiagnosticInput) => void;
}

const REGIONS = [
  'Sub-Saharan Africa',
  'Global',
  'North America',
  'Europe',
  'Latin America',
  'MENA',
  'South Asia',
  'Southeast Asia',
];

const STAGES: Stage[] = ['Idea', 'Prototype / MVP', 'Early Growth'];

const SECTORS = [
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

export const DiagnosticForm: React.FC<DiagnosticFormProps> = ({ initialValues, onSubmit }) => {
  const [currentWizardStep, setCurrentWizardStep] = useState<number>(1);
  const [form, setForm] = useState<DiagnosticInput>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isMeaningful = (text: string, minWords = 4, minChars = 25): { valid: boolean; error?: string } => {
    const trimmed = text.trim();
    if (trimmed.length < minChars) {
      return { valid: false, error: `Please provide more details (minimum ${minChars} characters).` };
    }
    const words = trimmed.split(/[\s,.;:!?]+/).filter((w) => w.length > 0);
    if (words.length < minWords) {
      return { valid: false, error: `Please provide at least ${minWords} words.` };
    }

    // Repetition check
    const unique = new Set(words.map((w) => w.toLowerCase()));
    if (words.length >= 4 && unique.size / words.length < 0.45) {
      return { valid: false, error: 'Input contains repetitive or placeholder text. Please enter a real description.' };
    }

    // Phonotactic / Gibberish detection
    let suspiciousWords = 0;
    for (const rawWord of words) {
      const w = rawWord.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (w.length <= 2) continue;

      const vowels = (w.match(/[aeiouy]/g) || []).length;
      const vowelRatio = vowels / w.length;

      // Unnatural consonant clusters or 0 vowels (e.g. "drhjb", "dndkd", "msdjfnxk", "kjsn")
      if (vowels === 0 || (w.length > 4 && vowelRatio < 0.18) || /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(w)) {
        suspiciousWords++;
        continue;
      }

      // Repeated 4+ identical characters (e.g. "aaaaa")
      if (/(.)\1{3,}/.test(w)) {
        suspiciousWords++;
        continue;
      }
    }

    if (words.length >= 2 && suspiciousWords / words.length > 0.3) {
      return {
        valid: false,
        error: 'Input contains unrecognizable words or random keystrokes. Please enter a real description of your startup.',
      };
    }

    return { valid: true };
  };

  const validateStep = (stepNumber: number): boolean => {
    const errs: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!form.startupName.trim() || form.startupName.trim().length < 2) {
        errs.startupName = 'Please enter a valid startup or venture name.';
      } else {
        const nameCheck = isMeaningful(form.startupName, 1, 2);
        if (!nameCheck.valid) {
          errs.startupName = 'Please enter a recognizable company name.';
        }
      }

      if (!form.tagline.trim()) {
        errs.tagline = 'Please provide a 1-sentence description of what your venture builds.';
      } else {
        const tagCheck = isMeaningful(form.tagline, 3, 15);
        if (!tagCheck.valid) {
          errs.tagline = tagCheck.error || 'Please provide a clear 1-sentence description.';
        }
      }

      if (!form.sector) {
        errs.sector = 'Please select a primary industry sector.';
      }
      if (!form.region) {
        errs.region = 'Please select an operating jurisdiction.';
      }
    } else if (stepNumber === 2) {
      const fieldACheck = isMeaningful(form.fieldA, 5, 30);
      if (!fieldACheck.valid) {
        errs.fieldA = fieldACheck.error || 'Please describe what you have built and validated (minimum 30 characters / 5 words).';
      }
    } else if (stepNumber === 3) {
      const fieldBCheck = isMeaningful(form.fieldB, 5, 30);
      if (!fieldBCheck.valid) {
        errs.fieldB = fieldBCheck.error || 'Please specify the exact milestone bottleneck this grant will fund (minimum 30 characters / 5 words).';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentWizardStep)) {
      setErrors({});
      setCurrentWizardStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentWizardStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(3)) {
      onSubmit(form);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-20 pt-6">
      {/* Intro Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-5xl font-serif font-semibold text-brand-purple-950 tracking-tight">
          Find Your Best-Fit Grants & Build a Winning Roadmap
        </h1>
        <p className="mt-3 text-base sm:text-lg text-brand-slate-600 max-w-2xl mx-auto font-sans leading-relaxed">
          Answer 3 quick questions about your startup. We'll match you against <span className="font-mono font-semibold text-brand-purple-950">100</span> verified equity-free grant programs and generate an auditable milestone roadmap for your applications.
        </p>
      </div>

      {/* Progressive 3-Step Wizard Container */}
      <div className="bg-white rounded-3xl border border-brand-slate-200 shadow-elevated p-8 sm:p-12">
        {/* Wizard Step Progress Indicator */}
        <div className="mb-10 pb-6 border-b border-brand-slate-100">
          <div className="flex items-center justify-between mb-3 text-xs sm:text-sm font-mono font-semibold text-brand-slate-500">
            <span className="text-brand-purple-900 font-bold">
              Step {currentWizardStep} of 3
            </span>
            <span className="text-brand-slate-700">
              {currentWizardStep === 1 && 'Startup Details & Industry'}
              {currentWizardStep === 2 && 'What You’ve Already Built'}
              {currentWizardStep === 3 && 'What You Need Funded'}
            </span>
          </div>

          <div className="h-2 w-full bg-brand-slate-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-brand-purple-900 transition-all duration-300 rounded-full"
              style={{
                width: currentWizardStep === 1 ? '33.33%' : currentWizardStep === 2 ? '66.66%' : '100%',
              }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: IDENTITY */}
          {currentWizardStep === 1 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-brand-slate-100 pb-4">
                <div className="flex items-center space-x-2.5 text-brand-purple-900 mb-1">
                  <Building2 className="w-5 h-5 text-brand-purple-800" />
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold text-brand-purple-950">
                    1. Tell us about your startup
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-brand-slate-600 font-sans leading-relaxed">
                  Provide your venture details, operating country or region, and primary industry sector.
                </p>
              </div>

              {/* Startup Name & Tagline */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-brand-slate-800 mb-2">
                    Startup / Venture Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.startupName}
                    onChange={(e) => setForm({ ...form, startupName: e.target.value })}
                    placeholder="e.g. AfyaBora Mama"
                    className={`w-full px-5 py-3.5 text-base sm:text-lg rounded-2xl border ${
                      errors.startupName ? 'border-rose-400 bg-rose-50/20' : 'border-brand-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-purple-700 transition-all font-sans`}
                  />
                  {errors.startupName && (
                    <p className="text-xs sm:text-sm text-rose-500 mt-2 flex items-center space-x-1.5 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.startupName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-brand-slate-800 mb-2">
                    1-Sentence Core Tagline <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    placeholder="e.g. Smartphone ultrasound AI tool for rural prenatal clinics in East Africa."
                    className={`w-full px-5 py-3.5 text-base sm:text-lg rounded-2xl border ${
                      errors.tagline ? 'border-rose-400 bg-rose-50/20' : 'border-brand-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-purple-700 transition-all font-sans`}
                  />
                  {errors.tagline && (
                    <p className="text-xs sm:text-sm text-rose-500 mt-2 flex items-center space-x-1.5 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.tagline}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Sector Dropdown */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-brand-slate-800 mb-2">
                  Primary Sector <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  className={`w-full px-5 py-3.5 text-base rounded-2xl border ${
                    errors.sector ? 'border-rose-400 bg-rose-50/20' : 'border-brand-slate-300'
                  } bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple-700 transition-all font-sans font-medium`}
                >
                  <option value="" disabled>Select primary industry sector</option>
                  {SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
                {errors.sector && (
                  <p className="text-xs sm:text-sm text-rose-500 mt-2 flex items-center space-x-1.5 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.sector}</span>
                  </p>
                )}
              </div>

              {/* Region & Stage Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-brand-slate-800 mb-2">
                    Operating Jurisdiction / Region <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    className={`w-full px-5 py-3.5 text-base rounded-2xl border ${
                      errors.region ? 'border-rose-400 bg-rose-50/20' : 'border-brand-slate-300'
                    } bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple-700 transition-all font-sans font-medium`}
                  >
                    <option value="" disabled>Select operating jurisdiction</option>
                    {REGIONS.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                  {errors.region && (
                    <p className="text-xs sm:text-sm text-rose-500 mt-2 flex items-center space-x-1.5 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.region}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-brand-slate-800 mb-2">
                    Maturity Stage <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
                    className="w-full px-5 py-3.5 text-base rounded-2xl border border-brand-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple-700 transition-all font-sans font-medium"
                  >
                    {STAGES.map((stg) => (
                      <option key={stg} value={stg}>
                        {stg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Women-Led Pill Box */}
              <div className="p-5 rounded-2xl bg-brand-slate-50 border border-brand-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-sm sm:text-base font-bold text-brand-slate-900 block">
                    Women-Founded / Female Leadership
                  </span>
                  <span className="text-xs sm:text-sm text-brand-slate-500">
                    Unlocks Cartier Women's Initiative, Visa She's Next, Amber & Tory Burch grant tracks
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={form.womenLed}
                    onChange={(e) => setForm({ ...form, womenLed: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-brand-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-brand-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-purple-800"></div>
                </label>
              </div>

              {/* Step 1 Navigation Button */}
              <div className="pt-6 border-t border-brand-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-purple-900 hover:bg-brand-purple-950 text-white font-bold text-base sm:text-lg flex items-center justify-center space-x-2.5 shadow-lg shadow-brand-purple-900/10 hover:shadow-xl transition-all"
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5 text-brand-gold-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: WHAT YOU'VE ALREADY BUILT */}
          {currentWizardStep === 2 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50/60 border border-emerald-200/80">
                <div className="flex items-center space-x-2.5 text-emerald-800 mb-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold text-emerald-950">
                    2. What have you already built and validated?
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-emerald-900 leading-relaxed font-sans">
                  Highlight your completed achievements, prototypes, or user pilots. We'll lock this in so grant committees see proven momentum with zero duplicate funding risk.
                </p>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-brand-slate-800 mb-2">
                  Completed Traction & Validated Baseline <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  value={form.fieldA}
                  onChange={(e) => setForm({ ...form, fieldA: e.target.value })}
                  placeholder="e.g. Built functional prototype, tested with 1,200 initial users across 3 pilot clinics, validated 91% diagnostic accuracy, and signed 2 institutional partner letters of intent."
                  className={`w-full p-5 text-base sm:text-lg rounded-2xl border ${
                    errors.fieldA ? 'border-rose-400 bg-rose-50/20' : 'border-emerald-300 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all font-sans leading-relaxed`}
                />
                
                <div className="flex items-center justify-between mt-2">
                  {errors.fieldA ? (
                    <p className="text-xs sm:text-sm text-rose-500 flex items-center space-x-1.5 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.fieldA}</span>
                    </p>
                  ) : (
                    <span className="text-xs text-brand-slate-500 font-sans">
                      Be specific with numbers, pilots, users, or tests completed.
                    </span>
                  )}
                  <span className="text-xs font-mono text-brand-slate-400">
                    {form.fieldA.length} chars
                  </span>
                </div>
              </div>

              {/* Step 2 Navigation Buttons */}
              <div className="pt-6 border-t border-brand-slate-100 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3.5 rounded-2xl border border-brand-slate-300 text-brand-slate-700 font-bold text-base hover:bg-brand-slate-50 transition-all flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-4 rounded-2xl bg-brand-purple-900 hover:bg-brand-purple-950 text-white font-bold text-base sm:text-lg flex items-center space-x-2.5 shadow-lg shadow-brand-purple-900/10 hover:shadow-xl transition-all"
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5 text-brand-gold-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: WHAT YOU NEED FUNDED */}
          {currentWizardStep === 3 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="p-6 sm:p-8 rounded-3xl bg-brand-gold-50/70 border border-brand-gold-300/80">
                <div className="flex items-center space-x-2.5 text-brand-purple-950 mb-2">
                  <Cpu className="w-6 h-6 text-brand-gold-600 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold text-brand-purple-950">
                    3. What specific milestone will this grant fund?
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-brand-slate-700 leading-relaxed font-sans">
                  Describe what you want to achieve with the grant capital. We'll convert your goal into a 12-week fundable milestone plan that committees can easily approve.
                </p>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-brand-slate-800 mb-2">
                  Funding Objective & Target Milestone <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  value={form.fieldB}
                  onChange={(e) => setForm({ ...form, fieldB: e.target.value })}
                  placeholder="e.g. Fund a formal 6-month multi-site clinical trial across 12 county clinics to secure Kenya Pharmacy and Poisons Board (PPB) regulatory clearance and train 60 community health workers."
                  className={`w-full p-5 text-base sm:text-lg rounded-2xl border ${
                    errors.fieldB ? 'border-rose-400 bg-rose-50/20' : 'border-brand-gold-400 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-brand-gold-500 transition-all font-sans leading-relaxed`}
                />

                <div className="flex items-center justify-between mt-2">
                  {errors.fieldB ? (
                    <p className="text-xs sm:text-sm text-rose-500 flex items-center space-x-1.5 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.fieldB}</span>
                    </p>
                  ) : (
                    <span className="text-xs text-brand-slate-500 font-sans">
                      Specify the operational deliverable or regulatory hurdle to be cleared.
                    </span>
                  )}
                  <span className="text-xs font-mono text-brand-slate-400">
                    {form.fieldB.length} chars
                  </span>
                </div>
              </div>

              {/* Intake Snapshot Review Pill Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-brand-slate-50 border border-brand-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-brand-slate-200/60 pb-2">
                  <span className="text-xs font-semibold text-brand-slate-700">
                    Diagnostic Summary
                  </span>
                  <span className="text-xs text-brand-slate-400 font-medium">Ready for evaluation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-brand-slate-200">
                    <span className="text-brand-slate-500 font-medium">Venture:</span>
                    <div className="flex items-center space-x-2">
                      <strong className="text-brand-purple-950 font-semibold">{form.startupName || 'Not named'}</strong>
                      <button
                        type="button"
                        onClick={() => setCurrentWizardStep(1)}
                        className="text-brand-purple-700 hover:underline font-bold"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-brand-slate-200">
                    <span className="text-brand-slate-500 font-medium">Sector & Region:</span>
                    <div className="flex items-center space-x-2">
                      <strong className="text-brand-purple-950 font-semibold">{form.sector} • {form.region}</strong>
                      <button
                        type="button"
                        onClick={() => setCurrentWizardStep(1)}
                        className="text-brand-purple-700 hover:underline font-bold"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>

                {form.fieldA && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-emerald-900">Validated Traction (Field A):</span>
                      <button
                        type="button"
                        onClick={() => setCurrentWizardStep(2)}
                        className="text-emerald-800 hover:underline font-bold"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-emerald-950 line-clamp-2 leading-relaxed">
                      {form.fieldA}
                    </p>
                  </div>
                )}
              </div>

              {/* Step 3 Navigation Buttons */}
              <div className="pt-6 border-t border-brand-slate-100 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3.5 rounded-2xl border border-brand-slate-300 text-brand-slate-700 font-bold text-base hover:bg-brand-slate-50 transition-all flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Step 2</span>
                </button>

                <button
                  type="submit"
                  className="px-8 py-4 rounded-2xl bg-brand-gold-400 hover:bg-brand-gold-500 text-brand-purple-950 font-bold text-base sm:text-lg flex items-center space-x-2.5 shadow-lg shadow-brand-gold-500/20 hover:shadow-xl transition-all duration-200 group"
                >
                  <span>Find Matching Grants & Build Roadmap</span>
                  <ArrowRight className="w-5 h-5 text-brand-purple-950 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <p className="text-center text-xs sm:text-sm text-brand-slate-500 font-sans pt-2">
                Evaluated against 100 verified grants • 100% Non-Dilutive • Instant Results
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

