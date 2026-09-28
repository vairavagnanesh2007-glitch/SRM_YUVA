import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Check, ShieldAlert, Cpu } from 'lucide-react';

export default function MathematicalProof({ proof, calculation }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!proof || !calculation) return null;

  const C = proof.c_conducted;
  const A = proof.a_attended;
  const R = proof.r_remaining;
  const total = proof.total_classes;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider text-[10px] text-indigo-700 uppercase tracking-wider block font-semibold">
              ALGORITHMIC TRANSPARENCY
            </span>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-0.5">
              How Was This Calculated? (Mathematical Proof)
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 font-semibold">
          <span>{isOpen ? 'Collapse Proof' : 'View Exact Formulas'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-6 text-sm">
          
          {/* Variable Definitions */}
          <div>
            <h5 className="font-mono text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              1. Established State Variables
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-[11px] font-medium">Classes Conducted (C)</span>
                <span className="text-base font-bold text-slate-900">{C}</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-[11px] font-medium">Classes Attended (A)</span>
                <span className="text-base font-bold text-emerald-700">{A}</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-[11px] font-medium">Remaining Classes (R)</span>
                <span className="text-base font-bold text-cyan-700">{R}</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-[11px] font-medium">Semester Total (C + R)</span>
                <span className="text-base font-bold text-indigo-700">{total}</span>
              </div>
            </div>
          </div>

          {/* 75% Formula Derivation */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-700">
                2. Mandatory 75% Threshold Derivation
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Requirement: Final Attendance ≥ 0.75
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 font-mono text-xs text-slate-800 border border-slate-200 space-y-1.5">
              <p>Inequality: (A + x) / (C + R) ≥ 0.75</p>
              <p>Substitute: ({A} + x) / ({C} + {R}) ≥ 0.75</p>
              <p>Multiply: {A} + x ≥ 0.75 × {total} = {proof.target_75_threshold_count}</p>
              <p>Isolate x: x ≥ {proof.target_75_threshold_count} - {A} = {proof.target_75_required_raw}</p>
              <p className="font-bold text-amber-700">
                → Required Classes to Attend (Ceiling): ⌈{proof.target_75_required_raw}⌉ = {proof.target_75_required_ceil} classes
              </p>
              <p className="text-emerald-700 font-semibold">
                → Safe To Miss: R - x = {R} - {proof.target_75_required_ceil} = {proof.target_75_safe_miss} classes
              </p>
            </div>
          </div>

          {/* 90% Formula Derivation */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-700">
                3. Academic Excellence (90%) Target Derivation
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Requirement: Final Attendance ≥ 0.90
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 font-mono text-xs text-slate-800 border border-slate-200 space-y-1.5">
              <p>Inequality: (A + x) / (C + R) ≥ 0.90</p>
              <p>Substitute: ({A} + x) / ({C} + {R}) ≥ 0.90</p>
              <p>Multiply: {A} + x ≥ 0.90 × {total} = {proof.target_90_threshold_count}</p>
              <p>Isolate x: x ≥ {proof.target_90_threshold_count} - {A} = {proof.target_90_required_raw}</p>
              <p className="font-bold text-cyan-700">
                → Required Classes to Attend (Ceiling): ⌈{proof.target_90_required_raw}⌉ = {proof.target_90_required_ceil} classes
              </p>
              <p className="text-emerald-700 font-semibold">
                → Safe To Miss for 90%: {calculation.target90?.possible ? `${proof.target_90_safe_miss} classes` : '0 (Target unreachable)'}
              </p>
            </div>
          </div>

          {/* Max Possible Calculation */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="font-mono text-xs font-bold text-slate-800">
              4. Maximum Possible Attendance Ceiling
            </span>
            <div className="p-3 rounded-lg bg-slate-50 font-mono text-xs text-slate-800 border border-slate-200 space-y-1">
              <p>Formula: ((A + R) / (C + R)) × 100</p>
              <p>Calculation: (({A} + {R}) / ({C} + {R})) × 100 = ({A + R} / {total}) × 100</p>
              <p className="font-bold text-slate-900 mt-1">
                Result: {calculation.maximumPossibleAttendance}%
              </p>
              {calculation.maximumPossibleAttendance < 75.0 && (
                <p className="text-rose-600 font-bold mt-1">
                  🚨 Irreversible Detention Condition Satisfied: Maximum possible {calculation.maximumPossibleAttendance}% &lt; 75.0%
                </p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
