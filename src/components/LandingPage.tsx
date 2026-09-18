import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Calendar,
  Database,
} from 'lucide-react';

interface LandingPageProps {
  onStartDiagnostic: (initialIndustry?: string) => void;
  onOpenLibrary: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDiagnostic,
  onOpenLibrary,
}) => {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-brand-slate-900 selection:bg-brand-purple-900 selection:text-white font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-brand-purple-800 border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
          {/* Brand Mark */}
          <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="/logo-white.png"
              alt="GrantHer — Empowering Women. Securing Futures."
              className="h-9 sm:h-10 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </div>

          {/* Right Action: Explore Grants */}
          <div className="flex items-center">
            <button
              onClick={onOpenLibrary}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all shadow-sm"
            >
              <Database className="w-4 h-4 text-brand-gold-400" />
              <span>Explore Grants</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative isolate min-h-[640px] lg:min-h-[700px] flex items-center overflow-hidden bg-[#FAFAF9] border-b border-brand-slate-200/80">
        {/* Aurora Gradient Blobs */}
        <div className="aurora-container" aria-hidden="true">
          <div className="aurora-blob aurora-blob-1" />
          <div className="aurora-blob aurora-blob-2" />
          <div className="aurora-blob aurora-blob-3" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 w-full">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
            {/* Left Column */}
            <div className="xl:col-span-7 flex flex-col justify-center">
              {/* Dominant Headline in Fraunces */}
              <h1 className="font-serif text-4xl md:text-5xl lg:text-[52px] font-semibold tracking-tight text-slate-900 leading-[1.14]">
                The grant capital engine built for women founders.
              </h1>

              {/* Subheadline */}
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-sans font-normal">
                Discover eligible equity-free grants and generate fundable, deliverable-backed milestone roadmaps for your applications in 5 minutes.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 max-w-xl">
                <button
                  onClick={() => onStartDiagnostic()}
                  className="px-8 py-4 rounded-full bg-brand-gold-400 hover:bg-brand-gold-500 text-brand-purple-950 text-base font-bold tracking-tight shadow-lg shadow-brand-gold-500/20 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2.5 font-sans"
                >
                  <span>Start Free Grant Diagnostic</span>
                  <ArrowRight className="w-5 h-5 text-brand-purple-950 stroke-[2.5]" />
                </button>

                <button
                  onClick={onOpenLibrary}
                  className="px-6 py-4 rounded-full bg-white hover:bg-brand-slate-50 text-brand-purple-950 border border-brand-slate-300/80 text-sm font-bold tracking-tight shadow-sm transition-all hover:border-brand-purple-300 flex items-center justify-center space-x-2 font-sans"
                >
                  <Database className="w-4 h-4 text-brand-purple-800" />
                  <span>Browse 100 Funds</span>
                </button>
              </div>

              {/* 3-Item Proof Counter */}
              <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-4 text-[13px] text-slate-600 font-sans font-medium">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong className="font-mono font-semibold text-slate-900">$85M+</strong> in 100 Verified Funds</span>
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong className="font-mono font-semibold text-slate-900">0%</strong> Equity Lost</span>
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong className="font-mono font-semibold text-slate-900">12-Week</strong> Milestone Roadmaps</span>
                </span>
              </div>
            </div>

            {/* Right Column: Hero Product Preview Card */}
            <div className="xl:col-span-5 flex justify-center xl:justify-end w-full relative">
              <div
                className="absolute -inset-8 pointer-events-none rounded-full blur-3xl opacity-70"
                style={{
                  background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />

              <div className="hero-preview-card w-full max-w-xl xl:max-w-lg bg-brand-purple-950 text-white rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(21,6,40,0.6)] border border-white/15 relative overflow-hidden transform-gpu md:rotate-[1deg] xl:rotate-[2.5deg] hover:rotate-0 hover:-translate-y-1.5 transition-all duration-500 ease-out z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-brand-gold-400 border border-white/10 font-mono">
                    <FileCheck className="w-3.5 h-3.5 text-brand-gold-400" />
                    <span>Committee Milestone Dossier</span>
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Auditable Preview</span>
                  </span>
                </div>

                {/* Venture Identity */}
                <div className="relative z-10">
                  <div className="text-xs text-brand-purple-300 font-mono mb-1">
                    Target Fund: <strong className="text-white">Visa She's Next Grant Program</strong>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-white tracking-tight">
                    Harvestlink
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-brand-purple-300 font-sans">
                    <span>Sector: <strong className="text-white">Agritech</strong></span>
                    <span>•</span>
                    <span>Region: <strong className="text-white">Sub-Saharan Africa</strong></span>
                  </div>
                </div>

                {/* Requested Funding Box */}
                <div className="relative z-10 mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-brand-purple-300 font-sans block">
                      Requested Capital
                    </span>
                    <div className="flex items-baseline space-x-1.5 mt-0.5">
                      <span className="text-3xl font-bold font-mono text-white">
                        $50,000
                      </span>
                      <span className="text-xs text-brand-purple-300 font-mono font-medium">USD</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 rounded-full">
                    100% Non-dilutive
                  </span>
                </div>

                {/* 12-Week 3-Tranche Release Horizon Bar */}
                <div className="relative z-10 mt-4 pt-3.5 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="font-semibold text-brand-purple-200 flex items-center space-x-1.5 font-sans">
                      <Calendar className="w-3.5 h-3.5 text-brand-gold-400" />
                      <span>12-Week Tranche Breakdown</span>
                    </span>
                    <span className="font-mono text-brand-gold-300 font-semibold">
                      3 Release Gates
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-400/25">
                      <span className="text-[11px] uppercase font-mono font-semibold text-blue-300 block">
                        T1 (W1–4)
                      </span>
                      <span className="text-sm font-mono font-bold text-white block mt-0.5">
                        $15,000
                      </span>
                      <span className="text-[11px] text-blue-200/90 font-sans block mt-0.5">
                        Foundation (30%)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-brand-purple-500/25 border border-brand-purple-400/25">
                      <span className="text-[11px] uppercase font-mono font-semibold text-brand-purple-300 block">
                        T2 (W5–8)
                      </span>
                      <span className="text-sm font-mono font-bold text-white block mt-0.5">
                        $20,000
                      </span>
                      <span className="text-[11px] text-brand-purple-200/90 font-sans block mt-0.5">
                        Integration (40%)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/25">
                      <span className="text-[11px] uppercase font-mono font-semibold text-emerald-300 block">
                        T3 (W9–12)
                      </span>
                      <span className="text-sm font-mono font-bold text-white block mt-0.5">
                        $15,000
                      </span>
                      <span className="text-[11px] text-emerald-200/90 font-sans block mt-0.5">
                        Attestation (30%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terminal Footer Verification Line */}
                <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-brand-purple-300 font-mono">
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Status: Verified Non-Overlapping</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funder Logo Marquee / Trust Strip */}
      <section className="bg-white border-b border-brand-slate-200 py-7 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-brand-slate-700 font-semibold text-sm sm:text-base">
            <span className="hover:text-brand-purple-950 transition-colors">Cartier Women's Initiative</span>
            <span className="text-brand-slate-300 hidden sm:inline">•</span>
            <span className="hover:text-brand-purple-950 transition-colors">Visa She's Next</span>
            <span className="text-brand-slate-300 hidden sm:inline">•</span>
            <span className="hover:text-brand-purple-950 transition-colors">Google for Startups</span>
            <span className="text-brand-slate-300 hidden sm:inline">•</span>
            <span className="hover:text-brand-purple-950 transition-colors">African Development Bank</span>
            <span className="text-brand-slate-300 hidden sm:inline">•</span>
            <span className="hover:text-brand-purple-950 transition-colors">Tony Elumelu Foundation</span>
            <span className="text-brand-slate-300 hidden sm:inline">•</span>
            <span className="hover:text-brand-purple-950 transition-colors">D-Prize</span>
            <span className="text-brand-slate-300 hidden sm:inline">•</span>
            <span className="hover:text-brand-purple-950 transition-colors">Stellar Foundation</span>
          </div>
        </div>
      </section>

      {/* Section 1: How It Works (Dark Background) */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-purple-950 text-white relative overflow-hidden border-b border-brand-purple-800/40">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-16 text-center sm:text-left">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
              How it works
            </h2>
            <p className="mt-4 text-base sm:text-lg text-brand-purple-200 font-sans leading-relaxed">
              From a 5-minute intake to an approval-ready proposal. Follow 4 clear steps to position your startup to win non-dilutive capital.
            </p>
          </div>

          {/* 4-Card Horizontal Grid with Progression Arrows */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Card 1: Input Your Startup & Traction */}
            <div className="bg-brand-purple-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/20 shadow-xl flex flex-col justify-between hover:border-white/40 hover:-translate-y-1 transition-all duration-300 relative group">
              <div>
                <div className="mb-5">
                  <span className="inline-flex text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-brand-purple-200 border border-white/10">
                    Step 1
                  </span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-white tracking-tight mb-3">
                  Input Startup & Traction
                </h3>
                <p className="text-sm text-purple-200 leading-relaxed font-sans">
                  Enter your startup profile, what you've validated so far, and your next target milestone. We lock in your baseline so past work isn't confused with new requests.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-sans text-brand-gold-400 font-semibold">
                <span>User Input → Stated Baseline</span>
                <ArrowRight className="w-4 h-4 text-brand-gold-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Instant Match & Blindspot Scan */}
            <div className="bg-brand-purple-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/20 shadow-xl flex flex-col justify-between hover:border-white/40 hover:-translate-y-1 transition-all duration-300 relative group">
              <div>
                <div className="mb-5">
                  <span className="inline-flex text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-brand-purple-200 border border-white/10">
                    Step 2
                  </span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-white tracking-tight mb-3">
                  Match & Scan Blindspots
                </h3>
                <p className="text-sm text-purple-200 leading-relaxed font-sans">
                  Our engine matches your profile across 100 verified grant programs and scans for unstated eligibility rules, governance criteria, or red flags before you apply.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-sans text-brand-gold-400 font-semibold">
                <span>Evaluation → Top Grant Fits</span>
                <ArrowRight className="w-4 h-4 text-brand-gold-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Customize 12-Week Roadmap */}
            <div className="bg-brand-purple-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/20 shadow-xl flex flex-col justify-between hover:border-white/40 hover:-translate-y-1 transition-all duration-300 relative group">
              <div>
                <div className="mb-5">
                  <span className="inline-flex text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-brand-purple-200 border border-white/10">
                    Step 3
                  </span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-white tracking-tight mb-3">
                  Customize 12-Week Plan
                </h3>
                <p className="text-sm text-purple-200 leading-relaxed font-sans">
                  Convert your goal into a 3-stage milestone plan (Foundation, Implementation, Validation) customized to the specific grant's evaluation rubric and metrics.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-sans text-brand-gold-400 font-semibold">
                <span>Roadmap → 3-Stage Tranches</span>
                <ArrowRight className="w-4 h-4 text-brand-gold-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Export Committee-Ready Dossier */}
            <div className="bg-brand-purple-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/20 shadow-xl flex flex-col justify-between hover:border-white/40 hover:-translate-y-1 transition-all duration-300 relative group">
              <div>
                <div className="mb-5">
                  <span className="inline-flex text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-brand-purple-200 border border-white/10">
                    Step 4
                  </span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-white tracking-tight mb-3">
                  Export Application Brief
                </h3>
                <p className="text-sm text-purple-200 leading-relaxed font-sans">
                  Copy individual tranches directly to MS Word / Google Docs or download an executive summary ready for immediate grant portal submission.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-sans text-emerald-300 font-semibold">
                <span>1-Click Export → Ready to Submit</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Before vs After Methodology (Light Background) */}
      <section id="methodology" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9] text-brand-slate-900 border-b border-brand-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-12 text-center sm:text-left">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-brand-purple-950 leading-tight">
              Grant committees reject ambiguity, not great ideas.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-brand-slate-600 font-sans leading-relaxed">
              Strong startups get passed over when proposals lack verifiable milestones, clear budget allocations, and measurable proof. GrantHer structures your application to make approval the easiest choice.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left Card: Standard Application (Rejected ❌) */}
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-rose-200 shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                  <span className="font-bold text-sm text-rose-600 font-sans">
                    Standard Application
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    High Rejection Risk
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-semibold text-brand-purple-950 tracking-tight">
                  Vague Wishlist Application
                </h3>
                
                {/* Application Snippet */}
                <div className="mt-5 p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80">
                  <blockquote className="text-base text-rose-950 font-serif italic leading-relaxed">
                    “Deploy mobile app and acquire 500 users.”
                  </blockquote>
                </div>

                <div className="mt-6 space-y-3 font-sans">
                  <ul className="space-y-2 text-sm text-brand-slate-600 leading-relaxed">
                    <li className="flex items-start space-x-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>No measurable verification metric (reviewers cannot tell what qualifies an active user).</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>Unclear capital breakdown—trustees cannot see where their funding goes.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>High risk of looking like duplicate funding for work you've already completed.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Card: GrantHer Standard (Approved ✅) */}
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-emerald-300 shadow-lg flex flex-col justify-between relative overflow-hidden ring-1 ring-emerald-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                  <span className="font-bold text-sm text-emerald-700 font-sans">
                    GrantHer Standard
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    Committee-Grade Tranche
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-semibold text-brand-purple-950 tracking-tight">
                  Auditable Deliverable Roadmap
                </h3>
                
                {/* Application Snippet */}
                <div className="mt-5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <blockquote className="text-base text-emerald-950 font-serif leading-relaxed">
                    “Deploy staging build to 3 partner clinics; submit verified telemetry logs and signed clinician feedback.”
                  </blockquote>
                </div>

                <div className="mt-6 space-y-3 font-sans">
                  <ul className="space-y-2 text-sm text-brand-slate-700 leading-relaxed">
                    <li className="flex items-start space-x-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>Clear verification metrics prove progress before each capital release.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>Distinctly separates past traction from newly funded milestones.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>Pre-screened for eligibility, compliance, and governance criteria.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Why GrantHer Advantage (Dark Background) */}
      <section id="why-granther" className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-purple-950 text-white border-b border-brand-purple-800/40">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
            Why GrantHer gives you an unfair advantage.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-brand-purple-200 max-w-2xl mx-auto font-sans leading-relaxed">
            We eliminate the guesswork, protect your cap table, and position your startup for maximum grant approval rates.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 sm:p-7 rounded-2xl bg-brand-purple-900/60 backdrop-blur-md border border-white/20 shadow-xl hover:border-white/40 transition-all">
              <div className="font-bold text-base text-white mb-2 font-sans flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-gold-400"></span>
                Keep 100% of Your Equity
              </div>
              <p className="text-sm text-purple-200 leading-relaxed font-sans">
                Every indexed grant in our directory is 100% non-dilutive capital. Secure non-repayable funding without sacrificing a single share of your company.
              </p>
            </div>
            <div className="p-6 sm:p-7 rounded-2xl bg-brand-purple-900/60 backdrop-blur-md border border-white/20 shadow-xl hover:border-white/40 transition-all">
              <div className="font-bold text-base text-white mb-2 font-sans flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-gold-400"></span>
                Engineered for Higher Win Rates
              </div>
              <p className="text-sm text-purple-200 leading-relaxed font-sans">
                Grant committees fund clarity, not promises. We transform your pitch into auditable, milestone-driven roadmaps that make approving your grant an easy decision.
              </p>
            </div>
            <div className="p-6 sm:p-7 rounded-2xl bg-brand-purple-900/60 backdrop-blur-md border border-white/20 shadow-xl hover:border-white/40 transition-all">
              <div className="font-bold text-base text-white mb-2 font-sans flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-gold-400"></span>
                Your Ideas & IP Stay 100% Yours
              </div>
              <p className="text-sm text-purple-200 leading-relaxed font-sans">
                Your proprietary startup plans, traction data, and roadmaps are completely private. We never sell your data or use it to train public AI models.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9] border-b border-brand-slate-200 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-brand-purple-950">
            Your first committee brief, in one session.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-brand-slate-600 font-sans leading-relaxed">
            <span className="font-mono font-semibold text-brand-purple-950">100</span> verified non-dilutive funds. <span className="font-mono font-semibold text-brand-purple-950">54</span> African nations & global tracks. <span className="font-mono font-semibold text-brand-purple-950">Zero</span> equity lost.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onStartDiagnostic()}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-gold-400 hover:bg-brand-gold-500 text-brand-purple-950 text-base font-bold tracking-tight shadow-md transition-all hover:scale-[1.02] flex items-center justify-center space-x-2.5 font-sans"
            >
              <span>Start Free Diagnostic Intake</span>
              <ArrowRight className="w-5 h-5 text-brand-purple-950 stroke-[2.5]" />
            </button>

            <button
              onClick={onOpenLibrary}
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-brand-slate-50 text-brand-purple-950 border border-brand-slate-300 text-base font-semibold tracking-tight shadow-sm transition-all font-sans"
            >
              Explore Grants
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-14 px-4 sm:px-6 lg:px-8 border-t border-brand-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/logo-dark.png"
                alt="GrantHer — Empowering Women. Securing Futures."
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-brand-slate-600 max-w-md font-sans leading-relaxed">
              The non-dilutive grant discovery and milestone roadmap engine built to help women founders secure non-repayable capital with confidence.
            </p>
            <div className="text-xs text-brand-slate-400 font-mono">
              Over $85,000,000 in non-dilutive capital ceiling indexed across 100 verified grant programs.
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-purple-950 font-mono mb-4">
              Grant Programs
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-slate-600 font-sans">
              <li><button onClick={onOpenLibrary} className="hover:text-brand-purple-900 transition-colors">Global Women-in-Tech</button></li>
              <li><button onClick={onOpenLibrary} className="hover:text-brand-purple-900 transition-colors">Pan-African & Emerging</button></li>
              <li><button onClick={onOpenLibrary} className="hover:text-brand-purple-900 transition-colors">Web3 & Frontier Tech</button></li>
              <li><button onClick={onOpenLibrary} className="hover:text-brand-purple-900 transition-colors">Multilateral & Climate</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-purple-950 font-mono mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-slate-600 font-sans">
              <li><a href="#how-it-works" className="hover:text-brand-purple-900 transition-colors">How It Works</a></li>
              <li><button onClick={onOpenLibrary} className="hover:text-brand-purple-900 transition-colors">Explore Grants</button></li>
              <li><a href="#why-granther" className="hover:text-brand-purple-900 transition-colors">Why GrantHer</a></li>
              <li><button onClick={() => onStartDiagnostic()} className="text-brand-purple-900 font-bold hover:underline">Launch Diagnostic →</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-brand-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-slate-500 font-sans">
          <div>
            © {new Date().getFullYear()} GrantHer. All rights reserved. 100% Non-dilutive capital allocation.
          </div>
          <div className="flex items-center space-x-6">
            <span>Confidential & Private</span>
            <span>•</span>
            <span>Zero Equity Taken</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
