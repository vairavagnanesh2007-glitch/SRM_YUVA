import React from 'react';
import { ArrowRight, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export default function ComparisonCard({ comparison, calculation }) {
  if (!comparison || !calculation) return null;

  const current = calculation.currentAttendance;
  const rem = calculation.classesRemaining;
  const need75 = calculation.target75?.requiredToAttend;
  const miss75 = calculation.target75?.safeToMiss;
  const need90 = calculation.target90?.requiredToAttend;
  const miss90 = calculation.target90?.safeToMiss;
  const maxP = calculation.maximumPossibleAttendance;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[11px] text-emerald-700 uppercase tracking-wider block font-semibold">
            PARADIGM SHIFT
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Why This Is Different
          </h3>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
          From Information → To Action
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Traditional Portal */}
        <div className="p-5 rounded-xl bg-slate-50 border border-rose-200 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-rose-700 font-mono text-xs font-bold uppercase tracking-wider">
            <XCircle className="h-4 w-4 text-rose-500" />
            <span>Traditional College Portal</span>
          </div>

          <div className="p-4 rounded-lg bg-white border border-slate-200 font-mono space-y-2 text-slate-700 text-sm shadow-xs">
            <p className="text-slate-600">Current Attendance: <strong className="text-slate-900 text-base">{current}%</strong></p>
            <p className="text-slate-500">Classes Conducted: {calculation.classesConducted}</p>
            <p className="text-slate-500">Classes Attended: {calculation.classesAttended}</p>
          </div>

          <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-200 pt-3">
            <p className="text-rose-700 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Passive historical reporting.</span>
            </p>
            <p>Students must manually guess whether they can skip a lecture, or discover detention when it's already too late.</p>
          </div>
        </div>

        {/* Overworld Attendance Predictor */}
        <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-4 shadow-sm relative">
          <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Overworld Attendance Decision Engine</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-xs">
              <span className="text-slate-500 block text-[10px] font-medium">Remaining Scheduled</span>
              <span className="text-cyan-800 font-bold text-sm">{rem} classes</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-xs">
              <span className="text-slate-500 block text-[10px] font-medium">Max Achievable</span>
              <span className="text-emerald-700 font-bold text-sm">{maxP}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-xs">
              <span className="text-slate-500 block text-[10px] font-medium">Need for 75%</span>
              <span className="text-amber-800 font-bold text-sm">{need75} classes</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-xs">
              <span className="text-slate-500 block text-[10px] font-medium">Safe to Miss (75%)</span>
              <span className="text-emerald-800 font-bold text-sm">{miss75} classes</span>
            </div>
          </div>

          <div className="text-xs text-slate-700 space-y-1.5 border-t border-emerald-200 pt-3">
            <p className="text-emerald-800 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Proactive forward decision engine.</span>
            </p>
            <p>Knows exact scheduled dates, informs students precisely what to attend and what can be safely missed without detention.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
