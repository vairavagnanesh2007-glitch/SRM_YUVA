import React from 'react';
import { Calendar, Flag, Clock, CheckCircle2 } from 'lucide-react';

export default function SemesterTimeline({ timeline }) {
  if (!timeline) return null;

  const pct = Math.min(100, Math.max(0, timeline.percentDaysElapsed || 0));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[11px] text-cyan-700 uppercase tracking-wider block font-semibold">
            SEMESTER TEMPORAL ROADMAP
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Attendance Milestone Timeline
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-600 font-medium">
          <span>{timeline.daysElapsed} days completed</span>
          <span>•</span>
          <span className="text-cyan-700 font-bold">{timeline.daysRemaining} days left</span>
        </div>
      </div>

      {/* Progress Bar with Milestone Nodes */}
      <div className="relative pt-6 pb-4">
        {/* Track Line */}
        <div className="h-2 bg-slate-100 rounded-full border border-slate-200 relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-xs font-mono">
          
          {/* Start */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">1. Semester Start</span>
            <span className="font-bold text-slate-900 text-sm block">29 Aug 2026</span>
            <span className="text-emerald-700 text-[11px] font-semibold">Academic kickoff</span>
          </div>

          {/* Classes Completed */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">2. Completed Classes</span>
            <span className="font-bold text-cyan-800 text-sm block">{timeline.classesCompleted} conducted</span>
            <span className="text-slate-500 text-[11px]">To date</span>
          </div>

          {/* Planning Window / Today */}
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1 shadow-sm">
            <span className="text-indigo-800 block text-[10px] uppercase font-bold">3. Reference / Plan Date</span>
            <span className="font-bold text-indigo-950 text-sm block">{timeline.planningDate}</span>
            <span className="text-indigo-700 text-[11px] font-medium">{timeline.planningWindowClasses} classes in window</span>
          </div>

          {/* Semester End */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">4. Semester End</span>
            <span className="font-bold text-slate-900 text-sm block">29 Nov 2026</span>
            <span className="text-amber-700 text-[11px] font-semibold">Detention cutoff</span>
          </div>

        </div>
      </div>
    </div>
  );
}
