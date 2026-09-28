import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Calculator, 
  CalendarCheck, 
  History, 
  CalendarRange, 
  AlertTriangle, 
  Compass, 
  ArrowUpRight,
  Cpu,
  Mic
} from 'lucide-react';

const TOUR_STEPS = [
  {
    id: 'welcome',
    badge: 'Welcome to Attendance Predictor',
    title: 'Your Autonomous Academic Standing Navigator',
    subtitle: 'SRM Institute of Science & Technology (SEEE) • Overworld Solution',
    description: 'Attendance Predictor replaces vague guesswork with deterministic integer mathematics, real timetables extracted from official PDFs, and predictive risk simulation.',
    icon: Sparkles,
    route: '/',
    highlights: [
      { label: 'Ground Truth Dataset', value: '10 verified sections, 45+ courses from official scans' },
      { label: 'Deterministic Precision', value: 'Exact integer ceil math with zero float-drift' },
      { label: 'Real Semester Window', value: 'Aug 29 – Nov 29, 2026 (13 full weeks)' },
    ],
    callToAction: 'Explore Predictor'
  },
  {
    id: 'daily',
    badge: 'Feature 1 • Daily Attendance Marking',
    title: 'Mark Today’s Attendance in Seconds',
    subtitle: 'Instant check-in mapped directly to today’s timetable periods',
    description: 'Pick your section and date to see every scheduled lecture. Mark classes as Present, Absent, or Cancelled with zero duplicates. All records persist safely in local storage.',
    icon: CalendarCheck,
    route: '/daily-attendance',
    highlights: [
      { label: '1-Click Marking', value: 'Present (green), Absent (rose), Cancelled (slate)' },
      { label: 'Duplicate Prevention', value: 'Composite unique keys prevent double-counting' },
      { label: 'Cancelled Handled', value: 'Excludes from conducted count without penalty' },
    ],
    callToAction: 'Try Daily Marking'
  },
  {
    id: 'history',
    badge: 'Feature 2 • Attendance History & Audit Trail',
    title: 'Complete Attendance History & Visual Calendar',
    subtitle: 'Search, filter, and inspect your full semester attendance timeline',
    description: 'Audit your past records with instant filtering by subject, status, or month. Switch seamlessly between a clean list view and an interactive calendar visualizer.',
    icon: History,
    route: '/history',
    highlights: [
      { label: 'Dual Visualization', value: 'Tabular audit log + full interactive calendar' },
      { label: 'Deep Filtering', value: 'Filter by Subject, Status (P/A/C), and Month' },
      { label: 'Course Summaries', value: 'Real conducted vs attended percentages calculated' },
    ],
    callToAction: 'View Attendance History'
  },
  {
    id: 'leave',
    badge: 'Feature 3 • Timetable-Integrated Leave Planner',
    title: 'Simulate Leave Before Taking It',
    subtitle: 'Accurate timetable impact projection without altering real records',
    description: 'Select start and end dates to see exactly how many class periods will be missed per course according to the timetable. Projects post-leave percentages and recovery requirements.',
    icon: CalendarRange,
    route: '/leave-planner',
    highlights: [
      { label: 'Zero Data Pollution', value: 'Pure simulation; leaves real marked records intact' },
      { label: 'Timetable Traversal', value: 'Traverses each calendar date, weekday, and period' },
      { label: 'Risk Pre-warning', value: 'Alerts if planned leave causes irreversible detention' },
    ],
    callToAction: 'Open Leave Planner'
  },
  {
    id: 'alerts',
    badge: 'Feature 4 • Attendance Risk Alerts',
    title: 'Automated Academic Risk & Recovery System',
    subtitle: 'Deterministic 3-tier classification with actionable recovery numbers',
    description: 'Continuously monitors your attendance against the regulatory threshold (default 75%). Instantly surfaces courses in Critical (<75%), Warning (75-79%), or Safe (≥80%) standing with exact recovery class counts.',
    icon: AlertTriangle,
    route: '/dashboard',
    highlights: [
      { label: 'Critical (< 75%)', value: 'Calculates exact consecutive classes to escape detention' },
      { label: 'Warning (75–79%)', value: 'Calculates fragile safe miss allowance' },
      { label: 'Safe (≥ 80%)', value: 'Comfort zone with exact skip budget' },
    ],
    callToAction: 'Check Risk Dashboard'
  },
  {
    id: 'decision_ai',
    badge: 'Core Engine • Decision Calculator & Real AI Bot',
    title: 'Mathematical Proofs, What-If & Voice Chat Bot',
    subtitle: 'Live voice guidance, On-Duty simulator & PDF export',
    description: 'Test hypothetical attendance scenarios, calculate OD recovery hours, chat with the real AI Attendance Advisor for strategic guidance, and export official PDF compliance reports.',
    icon: Mic,
    route: '/',
    highlights: [
      { label: 'Real AI Chat Bot', value: 'Conversational assistant with Web Speech voice recognition' },
      { label: 'OD Simulator', value: 'Calculate attendance boost from official On-Duty hours' },
      { label: 'Official PDF Export', value: 'Generate professional submission-ready attendance slips' },
    ],
    callToAction: 'Launch Predictor'
  }
];

export default function OnboardingGuide({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('has_seen_onboarding_guide_v1', 'true');
    onClose();
  };

  const handleJumpToPage = (route) => {
    handleComplete();
    navigate(route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          {/* Step Pill */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 bg-slate-100 text-slate-800">
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              <span>Step {currentStep + 1} of {TOUR_STEPS.length}</span>
            </span>
            <span className="text-xs text-slate-500 font-normal hidden sm:inline">
              Interactive Walkthrough
            </span>
          </div>

          {/* Close button */}
          <button 
            onClick={handleComplete}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Skip Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 space-y-6">
          
          {/* Main Visual Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
              <Icon className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-emerald-700 uppercase tracking-wider font-semibold block">
                {step.badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                {step.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {step.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 font-normal">
            {step.description}
          </p>

          {/* Highlights / Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {step.highlights.map((h, i) => (
              <div 
                key={i} 
                className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-2xs"
              >
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                  {h.label}
                </span>
                <span className="text-xs font-semibold text-slate-900 mt-1">
                  {h.value}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Jump Pill Tabs */}
          <div className="pt-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2 font-medium">
              Explore Any Module Directly:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    idx === currentStep
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {s.id === 'welcome' ? 'Overview' :
                   s.id === 'daily' ? 'Daily Mark' :
                   s.id === 'history' ? 'History' :
                   s.id === 'leave' ? 'Leave' :
                   s.id === 'alerts' ? 'Alerts' : 'Advisor'}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep 
                    ? 'w-5 bg-slate-900' 
                    : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {step.route && (
              <button
                onClick={() => handleJumpToPage(step.route)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
              >
                <span>{step.callToAction}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}

            {!isFirst && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="mobbin-btn-primary"
            >
              <span>{isLast ? 'Get Started' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
