import React from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, Flame, Skull } from 'lucide-react';

export default function DemoModal({ isOpen, onClose, onSelectScenario }) {
  if (!isOpen) return null;

  const scenarios = [
    {
      id: "danger_recoverable",
      title: "Scenario 1: 68% Danger Zone (Recoverable)",
      badge: "DANGER / RECOVERABLE",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      icon: Flame,
      sectionId: "III-ECE-B",
      subjectCode: "21MAB302T",
      attendancePercentage: 68.0,
      classesConducted: 25,
      classesAttended: 17,
      todayDate: "2026-09-28",
      planningDate: "2026-11-29",
      description: "Student is at 68% (17/25 attended). Need 22 out of 35 remaining to reach 75%. Recovery mathematically possible with 13 safe misses."
    },
    {
      id: "irreversible_detention",
      title: "Scenario 2: 🚨 Irreversible Detention (Impossible)",
      badge: "IRREVERSIBLE DETENTION",
      badgeColor: "bg-rose-50 text-rose-800 border-rose-300 font-bold",
      icon: Skull,
      sectionId: "III-ECE-B",
      subjectCode: "21MAB302T",
      attendancePercentage: 35.0,
      classesConducted: 40,
      classesAttended: 10,
      todayDate: "2026-10-25",
      planningDate: "2026-11-29",
      description: "Student attended only 10/40 classes. Even attending 100% of remaining 20 classes, final max is 50.0% < 75%. Triggers loud Detention Alert."
    },
    {
      id: "target90_unreachable",
      title: "Scenario 3: 90% Target Unreachable",
      badge: "WATCH / 90% UNREACHABLE",
      badgeColor: "bg-yellow-50 text-yellow-800 border-yellow-200",
      icon: AlertTriangle,
      sectionId: "III-ECE-A",
      subjectCode: "21MAB302T",
      attendancePercentage: 78.0,
      classesConducted: 30,
      classesAttended: 23,
      todayDate: "2026-10-10",
      planningDate: "2026-11-29",
      description: "75% is easily maintained, but 90% requires more classes than remaining in the semester. Displays 90% target unreachable."
    },
    {
      id: "safe_high_flier",
      title: "Scenario 4: 92% Safe Zone",
      badge: "SAFE / EXCELLENCE",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: ShieldCheck,
      sectionId: "II-ECE-DS-A",
      subjectCode: "21MAB201T",
      attendancePercentage: 92.0,
      classesConducted: 26,
      classesAttended: 24,
      todayDate: "2026-09-28",
      planningDate: "2026-11-29",
      description: "Currently at 92%. Required classes for 75% is 0. Student can safely miss up to 13 classes and still stay above 75%."
    },
    {
      id: "round2_room_locator",
      title: "Scenario 5: 📍 Round 2 — Free Class Locator & 3D Map",
      badge: "ROUND 2 OFFICIAL",
      badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-300 font-bold",
      icon: Sparkles,
      isRound2Link: true,
      description: "Interactive 3D Spatial Map across 7 floors of IST Building. Real-time availability from 10 timetables, AI natural language room search, live countdown timer, and 1-click WhatsApp squad summons."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden space-y-4 p-6 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wider block w-fit">
                HACKATHON EVALUATION
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Select a Judge Demo Preset Scenario
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Click any preset scenario below to automatically populate the real timetable dataset and run authoritative calculations in under 1 second:
        </p>

        {/* Scenarios List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  onSelectScenario(sc);
                  onClose();
                }}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-400 hover:bg-slate-100/70 cursor-pointer transition-all space-y-2 group shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {sc.title}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {sc.description}
                </p>
                <div className="flex gap-4 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                  <span>Section: <strong className="text-slate-800">{sc.sectionId}</strong></span>
                  <span>Subject: <strong className="text-slate-800">{sc.subjectCode}</strong></span>
                  <span>Attendance: <strong className="text-slate-800">{sc.attendancePercentage}%</strong></span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
