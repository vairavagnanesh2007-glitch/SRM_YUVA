import React from 'react';
import { Target, Shield, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function RecoveryGauge({ calculation }) {
  if (!calculation) return null;

  const current = calculation.currentAttendance || 0;
  const maxPossible = calculation.maximumPossibleAttendance || 0;
  const minPossible = calculation.minimumPossibleAttendance || 0;
  const isImpossible75 = !calculation.target75?.possible;
  const isImpossible90 = !calculation.target90?.possible;

  // Determine bar fill color
  let barGradient = "from-emerald-600 to-emerald-400";
  if (calculation.status === "IRREVERSIBLE_DETENTION") {
    barGradient = "from-red-600 to-rose-400";
  } else if (calculation.status === "DANGER") {
    barGradient = "from-orange-600 to-amber-400";
  } else if (calculation.status === "WATCH") {
    barGradient = "from-amber-600 to-yellow-400";
  }

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[11px] text-cyan-700 uppercase tracking-wider block font-semibold">
            ATTENDANCE TRAJECTORY & THRESHOLDS
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Semester Recovery Horizon
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Current: <strong className="text-slate-900 font-bold">{current}%</strong>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-700">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span>
            Max Possible: <strong className="text-slate-900 font-bold">{maxPossible}%</strong>
          </div>
        </div>
      </div>

      {/* Main Gauge Visualizer */}
      <div className="relative pt-6 pb-8">
        
        {/* Threshold Markers Above Bar */}
        <div className="relative w-full h-4 mb-1">
          {/* 75% Marker */}
          <div 
            className="absolute -top-1 transform -translate-x-1/2 flex flex-col items-center"
            style={{ left: '75%' }}
          >
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
              isImpossible75 
                ? 'bg-rose-100 text-rose-800 border-rose-300' 
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              75% DETENTION
            </span>
            <div className="w-0.5 h-3 bg-amber-500 mt-0.5"></div>
          </div>

          {/* 90% Marker */}
          <div 
            className="absolute -top-1 transform -translate-x-1/2 flex flex-col items-center"
            style={{ left: '90%' }}
          >
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
              isImpossible90 
                ? 'bg-slate-200 text-slate-700 border-slate-300' 
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              90% TARGET
            </span>
            <div className="w-0.5 h-3 bg-emerald-500 mt-0.5"></div>
          </div>
        </div>

        {/* Progress Track */}
        <div className="relative h-6 bg-slate-100 rounded-full border border-slate-200 p-1 overflow-hidden shadow-inner">
          
          {/* Max Possible Range Projection (Ghost bar) */}
          <div 
            className="absolute top-1 bottom-1 left-1 bg-cyan-100 border-r-2 border-cyan-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(0, maxPossible))}%` }}
            title={`Max Achievable: ${maxPossible}%`}
          />

          {/* Current Attendance Fill Bar */}
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-1000 shadow-sm relative`}
            style={{ width: `${Math.min(100, Math.max(0, current))}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
          </div>

          {/* Vertical Grid Lines inside the track */}
          <div className="absolute top-0 bottom-0 left-[75%] w-[2px] bg-amber-400 z-10"></div>
          <div className="absolute top-0 bottom-0 left-[90%] w-[2px] bg-emerald-400 z-10"></div>
        </div>

        {/* Labels Below Bar */}
        <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2 px-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span className="text-amber-700 font-semibold">75% (Danger Zone)</span>
          <span className="text-emerald-700 font-semibold">90% (Safe Target)</span>
          <span>100%</span>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[11px] font-medium">Current Score</span>
          <span className="font-mono text-base font-bold text-slate-900">{current}%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[11px] font-medium">Max Achievable</span>
          <span className="font-mono text-base font-bold text-cyan-700">{maxPossible}%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[11px] font-medium">75% Goal</span>
          <span className={`font-mono text-xs font-bold block mt-1 ${isImpossible75 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {isImpossible75 ? '❌ UNREACHABLE' : `Attend ${calculation.target75?.requiredToAttend} more`}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[11px] font-medium">90% Goal</span>
          <span className={`font-mono text-xs font-bold block mt-1 ${isImpossible90 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {isImpossible90 ? '⚠️ UNREACHABLE' : `Attend ${calculation.target90?.requiredToAttend} more`}
          </span>
        </div>
      </div>

    </div>
  );
}
