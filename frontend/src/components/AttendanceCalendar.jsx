import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, X, AlertCircle } from 'lucide-react';

export default function AttendanceCalendar({ calendarDays, calculation }) {
  const [selectedDay, setSelectedDay] = useState(null);

  if (!calendarDays || calendarDays.length === 0) return null;

  // Group by month
  const months = {};
  calendarDays.forEach((day) => {
    const monthKey = `${day.monthName} 2026`;
    if (!months[monthKey]) months[monthKey] = [];
    months[monthKey].push(day);
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[11px] text-cyan-700 uppercase tracking-wider block font-semibold">
            INTERACTIVE SEMESTER CALENDAR
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Full Semester Schedule (Aug 29 – Nov 29)
          </h3>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span>
            <span className="text-slate-700 font-medium">Upcoming Class</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-600 border border-cyan-700"></span>
            <span className="text-slate-700 font-medium">Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300"></span>
            <span className="text-slate-500 font-medium">Past Class</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white border border-slate-200"></span>
            <span className="text-slate-400 font-medium">No Class</span>
          </div>
        </div>
      </div>

      {/* Months Grid */}
      <div className="space-y-6">
        {Object.entries(months).map(([monthName, days]) => (
          <div key={monthName} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              {monthName}
            </h4>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-mono">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dw) => (
                <div key={dw} className="text-[10px] text-slate-500 uppercase py-1 font-semibold">
                  {dw}
                </div>
              ))}

              {/* Offset days before 1st day of month slice if needed */}
              {Array.from({ length: (new Date(days[0].date).getDay() + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2 opacity-0"></div>
              ))}

              {days.map((d) => {
                const isToday = d.state === 'TODAY';
                const isPast = d.state === 'PAST';
                const hasClass = d.hasClass;

                let cellStyle = "bg-white text-slate-400 border border-slate-200";
                if (isToday) {
                  cellStyle = "bg-cyan-600 text-white font-bold border-cyan-600 shadow-sm";
                } else if (hasClass) {
                  if (isPast) {
                    cellStyle = "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-400 cursor-pointer font-medium";
                  } else {
                    cellStyle = "bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-400 cursor-pointer shadow-sm font-semibold";
                  }
                }

                return (
                  <button
                    key={d.date}
                    onClick={() => hasClass && setSelectedDay(d)}
                    className={`relative p-2 rounded-lg transition-all flex flex-col items-center justify-center min-h-[48px] ${cellStyle}`}
                  >
                    <span className="text-xs">{d.dayNumber}</span>
                    {hasClass && (
                      <span className={`text-[9px] font-mono px-1 rounded mt-1 font-bold ${
                        isToday ? 'bg-cyan-700 text-white' : 'bg-slate-200/80 text-slate-700'
                      }`}>
                        {d.classCount}p
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Day Modal Inspector */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-700 font-semibold">Class Inspector</span>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedDay.date} ({selectedDay.dayName})
                </h4>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">Status:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200">
                  {selectedDay.state}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-600 block font-semibold">Scheduled Periods:</span>
                {selectedDay.classes.map((cls, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-slate-900 font-bold">
                      <span>{cls.subjectName}</span>
                      <span className="text-cyan-700 font-bold">Period {cls.period}</span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-2">
                      <Clock className="h-3 w-3 text-cyan-600" />
                      <span>{cls.time}</span>
                      <span>• Venue: {cls.venue}</span>
                    </div>
                    {cls.faculty && (
                      <div className="text-slate-500">
                        Faculty: {cls.faculty}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {calculation && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-mono space-y-1 text-emerald-900">
                  <span className="text-emerald-800 font-bold block">Attendance Strategy Impact:</span>
                  <p>• Attending this class increases your standing towards 75%.</p>
                  <p>• Missing this class consumes 1 of your {calculation.target75?.safeToMiss} safe miss allowances.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-mono font-semibold text-white transition-colors shadow-sm"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
