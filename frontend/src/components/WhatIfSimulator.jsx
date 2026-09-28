import React, { useState, useEffect } from 'react';
import { Sliders, Flame, ShieldAlert, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { simulateWhatIf } from '../services/api';

export default function WhatIfSimulator({ calculation }) {
  if (!calculation) return null;

  const C = calculation.classesConducted;
  const A = calculation.classesAttended;
  const R = calculation.classesRemaining;

  const [missNext, setMissNext] = useState(0);
  const [attendNext, setAttendNext] = useState(0);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Run simulation whenever missNext or attendNext changes
    let isMounted = true;
    const runSim = async () => {
      setLoading(true);
      try {
        const res = await simulateWhatIf({
          classesConducted: C,
          classesAttended: A,
          classesRemaining: R,
          attendNext: parseInt(attendNext) || 0,
          missNext: parseInt(missNext) || 0
        });
        if (isMounted) setSimulationResult(res);
      } catch (err) {
        console.error("Simulation error", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    runSim();
    return () => { isMounted = false; };
  }, [C, A, R, missNext, attendNext]);

  const handleQuickMiss = (count) => {
    const val = Math.min(R, count);
    setMissNext(val);
  };

  const handleQuickAttend = (count) => {
    const val = Math.min(R, count);
    setAttendNext(val);
  };

  const handleReset = () => {
    setMissNext(0);
    setAttendNext(0);
  };

  const projected = simulationResult?.projected || calculation;
  const impact = simulationResult?.impact || {};
  const isDetentionTriggered = impact.isDetentionTriggered;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[11px] text-amber-600 uppercase tracking-wider block">
            INTERACTIVE SCENARIO LAB
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-amber-500" />
            What-If Attendance Simulator
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-mono text-slate-700 font-semibold transition-all border border-slate-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Miss Next Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-rose-600 font-semibold flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-rose-500" />
                Simulate Missing Classes:
              </span>
              <span className="text-base font-bold text-rose-700 px-2 py-0.5 rounded bg-rose-100 border border-rose-200">
                {missNext} classes
              </span>
            </div>

            <input
              type="range"
              min="0"
              max={Math.min(R, 30)}
              value={missNext}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setMissNext(val);
                if (val + attendNext > R) setAttendNext(R - val);
              }}
              className="w-full accent-rose-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />

            {/* Quick Miss Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] font-mono text-slate-500 py-1 font-semibold">Quick Select:</span>
              {[1, 2, 3, 5, 8].map((num) => (
                <button
                  key={num}
                  disabled={num > R}
                  onClick={() => handleQuickMiss(num)}
                  className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
                    missNext === num
                      ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
                  }`}
                >
                  Miss {num}
                </button>
              ))}
            </div>
          </div>

          {/* Attend Next Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-emerald-600" />
                Simulate Attending Classes:
              </span>
              <span className="text-base font-bold text-emerald-800 px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200">
                {attendNext} classes
              </span>
            </div>

            <input
              type="range"
              min="0"
              max={Math.min(R, 30)}
              value={attendNext}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setAttendNext(val);
                if (val + missNext > R) setMissNext(R - val);
              }}
              className="w-full accent-emerald-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />

            {/* Quick Attend Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] font-mono text-slate-500 py-1 font-semibold">Quick Select:</span>
              {[1, 3, 5, 10, 15].map((num) => (
                <button
                  key={num}
                  disabled={num > R}
                  onClick={() => handleQuickAttend(num)}
                  className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
                    attendNext === num
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  Attend {num}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Real-Time Projected Outcome Card */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm space-y-4">
          
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">
              Projected Simulation Outcome
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold font-mono text-slate-900">
                {projected.currentAttendance}%
              </span>
              {impact.attendanceChange !== undefined && (
                <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded border ${
                  impact.attendanceChange >= 0
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {impact.attendanceChange >= 0 ? `+${impact.attendanceChange}%` : `${impact.attendanceChange}%`}
                </span>
              )}
            </div>
          </div>

          {/* Critical Warnings */}
          {isDetentionTriggered && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono animate-pulse flex items-start gap-2 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-rose-700 text-xs font-semibold tracking-wider text-[10px] tracking-wider mb-1">
                  CRITICAL: IRREVERSIBLE DETENTION TRIGGERED
                </strong>
                Missing {missNext} classes mathematically locks you below 75% for the semester.
              </div>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="space-y-2 text-xs font-mono border-t border-slate-200 pt-3">
            <div className="flex justify-between text-slate-600">
              <span>Status after simulation:</span>
              <strong className="text-slate-900 uppercase font-bold">{projected.statusLabel || projected.status}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Safe classes left to miss (75%):</span>
              <strong className="text-emerald-700 font-bold">{projected.target75?.safeToMiss} classes</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Must attend for 75%:</span>
              <strong className="text-amber-700 font-bold">{projected.target75?.requiredToAttend} classes</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Max possible ceiling:</span>
              <strong className="text-sky-700 font-bold">{projected.maximumPossibleAttendance}%</strong>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
