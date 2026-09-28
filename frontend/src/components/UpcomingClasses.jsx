import React from 'react';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';

export default function UpcomingClasses({ classes, subjectName, subjectCode }) {
  if (!classes || classes.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
        <p>No remaining scheduled classes found for this subject in the selected window.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[11px] text-cyan-700 uppercase tracking-wider block font-semibold">
            CHRONOLOGICAL TIMETABLE SCHEDULE
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Upcoming Classes ({classes.length} scheduled)
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 font-medium">
          Real Timetable Occurrences
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {classes.map((cls, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                {cls.formattedDate}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold">
                Period {cls.period}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-600 font-mono">
              <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                <Clock className="h-3.5 w-3.5 text-cyan-600" />
                <span>{cls.time || "Scheduled Timing"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                <span>Venue: {cls.venue}</span>
              </div>
              {cls.faculty && (
                <div className="flex items-center gap-1.5 truncate">
                  <User className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{cls.faculty}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
