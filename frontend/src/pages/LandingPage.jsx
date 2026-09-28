import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  Sliders, 
  AlertTriangle, 
  Flame, 
  Sparkles, 
  CalendarCheck,
  History,
  CalendarRange,
  Layers,
  FileCheck2,
  Mic,
  Cpu,
  Clock,
  Compass,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Download
} from 'lucide-react';

const MODULE_TABS = [
  { id: 'all', label: 'All Modules' },
  { id: 'daily', label: 'Daily Marking' },
  { id: 'history', label: 'Attendance History' },
  { id: 'leave', label: 'Leave Planner' },
  { id: 'alerts', label: 'Risk Alerts' },
  { id: 'engine', label: 'Decision Engine' },
  { id: 'od', label: 'OD Simulator' }
];

const MODULE_CARDS = [
  {
    category: 'daily',
    badge: 'Real-time Slot Tracking',
    title: 'Daily Attendance Marking',
    description: 'Mark today’s scheduled classes as Present, Absent, or Cancelled directly from your section’s official timetable. Duplicate prevention and instant local persistence.',
    route: '/daily-attendance',
    icon: CalendarCheck,
    tag: 'Feature 1',
    metricLabel: 'Timetable Periods',
    metricValue: 'P1 – P9 Sync'
  },
  {
    category: 'history',
    badge: 'Audit Trail & Visualizer',
    title: 'Attendance History & Calendar',
    description: 'Inspect past records across the semester. Filter by course, status, or month, and switch between clean tabular audit logs and interactive visual calendar views.',
    route: '/history',
    icon: History,
    tag: 'Feature 2',
    metricLabel: 'View Modes',
    metricValue: 'Table & Calendar'
  },
  {
    category: 'leave',
    badge: 'Timetable Impact Projection',
    title: 'Leave Planner & Simulator',
    description: 'Simulate the impact of taking leave between dates before applying. Traverses each weekday period to calculate exact class losses without modifying actual records.',
    route: '/leave-planner',
    icon: CalendarRange,
    tag: 'Feature 3',
    metricLabel: 'Record Safety',
    metricValue: 'Zero Data Pollution'
  },
  {
    category: 'alerts',
    badge: 'Regulatory Risk Engine',
    title: 'Attendance Risk Alerts',
    description: 'Automated 3-tier standing classification: Critical (<75%), Warning (75–79%), and Safe (≥80%). Calculates exact consecutive lectures needed to escape detention.',
    route: '/dashboard',
    icon: AlertTriangle,
    tag: 'Feature 4',
    metricLabel: 'Detention Warning',
    metricValue: 'Exact Recovery Math'
  },
  {
    category: 'engine',
    badge: 'Deterministic Precision',
    title: 'Strategic Decision Engine',
    description: 'Answers how many classes you must attend and how many you can safely miss using integer ceiling mathematics. Includes What-If simulations and mathematical proofs.',
    route: '/calculator',
    icon: Cpu,
    tag: 'Core Engine',
    metricLabel: 'Math Engine',
    metricValue: '⌈0.75N - ε⌉ Exact'
  },
  {
    category: 'od',
    badge: 'Institutional Compliance',
    title: 'On-Duty (OD) & Medical Simulator',
    description: 'Simulate attendance boosts from On-Duty approvals, hackathons, sports events, and medical exemptions. Generates official submission letters with single-click export.',
    route: '/od-simulator',
    icon: FileCheck2,
    tag: 'OD Policy',
    metricLabel: 'Letter Export',
    metricValue: 'Official Format'
  }
];

export default function LandingPage({ onOpenDemo }) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredCards = activeTab === 'all' 
    ? MODULE_CARDS 
    : MODULE_CARDS.filter(c => c.category === activeTab);

  return (
    <div className="space-y-20 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Mobbin-Style Hero Section */}
      <section className="relative text-center pt-6 pb-4 space-y-6 max-w-4xl mx-auto">
        
        {/* Top Pill Announcement */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-medium text-white">SRM SEEE Official Timetable Dataset</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">Phase 1 & Phase 2 Complete</span>
        </div>

        {/* Hero Title (Clean, Bold, Modern Sans) */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
          Attendance intelligence for <br className="hidden sm:inline" />
          <span className="text-zinc-400">engineering students.</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
          Stop guessing your attendance. Know exactly what you can safely miss, calculate recovery classes with mathematical certainty, and simulate leaves before taking them.
        </p>

        {/* Pill CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/daily-attendance"
            className="mobbin-btn-primary px-5 py-3 text-sm"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Mark Daily Attendance</span>
          </Link>

          <Link
            to="/calculator"
            className="mobbin-btn-secondary px-5 py-3 text-sm"
          >
            <span>Decision Engine</span>
            <ArrowRight className="h-4 w-4 text-zinc-400" />
          </Link>

          <button
            onClick={onOpenDemo}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-sm font-medium transition-all"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Judge Presets</span>
          </button>
        </div>

        {/* 4 Minimalist Metric Cards */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <span className="text-zinc-500 text-xs block font-medium">Semester Window</span>
            <span className="font-semibold text-white text-sm block mt-1">29 Aug – 29 Nov 2026</span>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">13 Instructional Weeks</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <span className="text-zinc-500 text-xs block font-medium">Detention Cutoff</span>
            <span className="font-semibold text-amber-400 text-sm block mt-1">75.0% Mandatory</span>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">Exam Hall Clearance</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <span className="text-zinc-500 text-xs block font-medium">Excellence Target</span>
            <span className="font-semibold text-emerald-400 text-sm block mt-1">90.0% Distinction</span>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">Academic Honors</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <span className="text-zinc-500 text-xs block font-medium">Timetable Source</span>
            <span className="font-semibold text-white text-sm block mt-1">10 Class Sections</span>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">Scanned Official PDFs</span>
          </div>
        </div>

      </section>

      {/* Mobbin-Style Module Explorer with Pill Tabs */}
      <section className="space-y-6 pt-4">
        
        {/* Section Header & Pill Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
              Complete System Suite
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Explore Attendance Predictor
            </h2>
          </div>

          {/* Mobbin-style Pill Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {MODULE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobbin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                to={card.route}
                className="mobbin-card p-6 flex flex-col justify-between group space-y-5"
              >
                <div className="space-y-4">
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-200 group-hover:text-white group-hover:border-zinc-500 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700 font-mono font-medium">
                        {card.tag}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <span className="text-[11px] text-zinc-500 font-medium block">
                      {card.badge}
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight mt-1 group-hover:text-emerald-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">{card.metricLabel}</span>
                    <span className="font-mono font-medium text-zinc-300 text-xs">{card.metricValue}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 font-semibold text-zinc-300 group-hover:text-white transition-colors">
                    <span>Open</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </section>

      {/* Core Academic Decision Pillars */}
      <section className="space-y-6 pt-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Deterministic Decision Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Answers Every Attendance Dilemma
          </h2>
          <p className="text-sm text-zinc-400">
            Ground-truth mathematical proofs replace anxiety with clear strategic choices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="mobbin-card p-6 space-y-3">
            <div className="p-2.5 w-fit rounded-xl bg-zinc-800 border border-zinc-700 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              "How many classes can I safely miss?"
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Never gamble with your exam hall ticket. Our mathematical derivation tells you the precise number of classes you can miss while comfortably finishing at or above 75%.
            </p>
            <div className="pt-2 text-xs font-mono text-zinc-400">
              SafeToMiss = Remaining - Required
            </div>
          </div>

          <div className="mobbin-card p-6 space-y-3">
            <div className="p-2.5 w-fit rounded-xl bg-zinc-800 border border-zinc-700 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              "Can I still recover from detention?"
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              If your attendance falls into the danger zone, we calculate the exact integer count of upcoming lectures you must attend consecutively to climb back above 75%.
            </p>
            <div className="pt-2 text-xs font-mono text-zinc-400">
              Required = max(0, ceil(0.75 * N) - Attended)
            </div>
          </div>

          <div className="mobbin-card p-6 space-y-3">
            <div className="p-2.5 w-fit rounded-xl bg-zinc-800 border border-zinc-700 text-rose-400">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              "Is recovery mathematically impossible?"
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              When remaining classes are mathematically insufficient to reach 75%, the engine emits a loud <strong>IRREVERSIBLE DETENTION</strong> warning with complete mathematical proof.
            </p>
            <div className="pt-2 text-xs font-mono text-zinc-400">
              Condition: MaxPossible &lt; 75.0%
            </div>
          </div>

        </div>
      </section>

      {/* Bottom Minimalist CTA */}
      <section className="p-10 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center space-y-5">
        <h3 className="text-2xl font-bold tracking-tight text-white">
          Ready to Calculate Your Attendance Strategy?
        </h3>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto">
          Select your class section, inspect your subject attendance records, and generate submission-ready compliance reports in seconds.
        </p>
        <div className="pt-2 flex justify-center">
          <Link
            to="/calculator"
            className="mobbin-btn-primary px-6 py-3 text-sm"
          >
            <span>Launch Attendance Predictor</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
