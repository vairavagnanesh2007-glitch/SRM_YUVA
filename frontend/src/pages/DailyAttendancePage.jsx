import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CalendarCheck, 
  MapPin, 
  User, 
  Check, 
  X, 
  Ban, 
  AlertCircle, 
  History, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { getSections, getSectionSchedule } from '../services/api';
import { markAttendanceRecord, getDailyRecords } from '../services/attendanceStorage';
import confetti from 'canvas-confetti';

export default function DailyAttendancePage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('III-ECE-B');
  const [selectedDate, setSelectedDate] = useState('2026-09-28');
  
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markedRecords, setMarkedRecords] = useState({});
  const [actionFeedback, setActionFeedback] = useState(null);

  useEffect(() => {
    async function loadSecs() {
      try {
        const data = await getSections();
        setSections(data);
        if (data.length > 0 && !selectedSection) {
          setSelectedSection(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load sections", err);
      }
    }
    loadSecs();
  }, []);

  useEffect(() => {
    if (!selectedSection) return;

    async function loadDaySchedule() {
      setLoading(true);
      setError(null);
      try {
        const data = await getSectionSchedule(selectedSection, selectedDate);
        setScheduleData(data);

        // Load recorded attendance for this date from localStorage
        const stored = getDailyRecords(selectedSection, selectedDate);
        const map = {};
        stored.forEach(r => {
          map[r.period] = r;
        });
        setMarkedRecords(map);
      } catch (err) {
        setError(err.response?.data?.detail || "Could not load schedule for this date.");
      } finally {
        setLoading(false);
      }
    }

    loadDaySchedule();
  }, [selectedSection, selectedDate]);

  const handleMark = (classItem, status) => {
    const isAlreadyMarked = Boolean(markedRecords[classItem.period]);
    const previousStatus = markedRecords[classItem.period]?.status;

    const res = markAttendanceRecord({
      sectionId: selectedSection,
      date: selectedDate,
      subjectCode: classItem.subjectCode,
      subjectName: classItem.subjectName,
      period: classItem.period,
      time: classItem.time,
      faculty: classItem.faculty,
      venue: classItem.venue || scheduleData?.venue,
      status: status
    });

    if (res.success) {
      setMarkedRecords(prev => ({
        ...prev,
        [classItem.period]: res.record
      }));

      const statusText = status === 'PRESENT' ? 'Present' : status === 'ABSENT' ? 'Absent' : 'Cancelled';
      const msg = isAlreadyMarked && previousStatus !== status
        ? `Updated Period ${classItem.period} (${classItem.subjectName}) to ${statusText}.`
        : `Marked Period ${classItem.period} (${classItem.subjectName}) as ${statusText}.`;

      setActionFeedback(msg);
      setTimeout(() => setActionFeedback(null), 3000);

      if (status === 'PRESENT') {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.7 }
        });
      }
    }
  };

  const totalClasses = scheduleData?.classes?.length || 0;
  const recordedList = Object.values(markedRecords);
  const presentCount = recordedList.filter(r => r.status === 'PRESENT').length;
  const absentCount = recordedList.filter(r => r.status === 'ABSENT').length;
  const cancelledCount = recordedList.filter(r => r.status === 'CANCELLED').length;
  const markedCount = recordedList.length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1550px] mr-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Timetable Ingestion & Real-Time Marking</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Daily Attendance Marking
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Record lecture attendance for today's scheduled classes. Records persist safely across sessions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/history"
              className="mobbin-btn-secondary"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Attendance History</span>
            </Link>
          </div>
        </div>

        {/* Section & Date Selection Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                Class Section:
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.year})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                Instructional Date:
              </label>
              <input
                type="date"
                min="2026-08-29"
                max="2026-11-29"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-full px-3.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="text-right sm:self-center">
            <span className="text-[11px] text-slate-400 block uppercase font-medium">
              {scheduleData?.dayName || 'Day Schedule'}
            </span>
            <span className="text-xs font-semibold text-slate-800">
              Room: {scheduleData?.venue || 'IST 518/AN'}
            </span>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {actionFeedback && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionFeedback}</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-mono">Saved</span>
          </div>
        )}

        {/* Day Metric Counters (White Theme Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Scheduled Today</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">{totalClasses} Lectures</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">{markedCount} of {totalClasses} marked</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Attended (Present)</span>
            <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">{presentCount}</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Counts as attended</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Absent</span>
            <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">{absentCount}</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Counts as conducted</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Cancelled</span>
            <span className="text-2xl font-bold font-mono text-slate-500 mt-1 block">{cancelledCount}</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Excluded from total</span>
          </div>
        </div>

        {/* Schedule Classes List */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4 bg-white border border-slate-200 rounded-3xl shadow-xs">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-mono">Loading timetable for {selectedDate}...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center space-y-2 shadow-xs">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-900">{error}</p>
          </div>
        ) : scheduleData?.classes?.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Scheduled Classes on this Date</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {scheduleData.dayName} is a non-instructional day or has no periods assigned in the official timetable.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Timetable for {scheduleData?.dayName} — {selectedDate}
              </h2>
              <span className="text-xs text-slate-400">
                Click an action to mark attendance
              </span>
            </div>

            <div className="space-y-3">
              {scheduleData?.classes?.map((cls) => {
                const existing = markedRecords[cls.period];
                const currentStatus = existing?.status;

                return (
                  <div 
                    key={cls.period}
                    className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      currentStatus === 'PRESENT'
                        ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                        : currentStatus === 'ABSENT'
                        ? 'bg-rose-50/40 border-rose-300 shadow-xs'
                        : currentStatus === 'CANCELLED'
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Period & Course Information */}
                    <div className="space-y-1.5 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          Period {cls.period}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {cls.time}
                        </span>
                        {cls.slot && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                            Slot {cls.slot}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 tracking-tight leading-snug">
                        {cls.subjectName}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span className="font-mono text-slate-700 font-semibold">{cls.subjectCode}</span>
                        {cls.faculty && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <User className="w-3 h-3 text-slate-400" />
                            {cls.faculty}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {cls.venue || scheduleData.venue}
                        </span>
                      </div>

                      {/* Status indicator */}
                      {currentStatus && (
                        <div className="pt-1 flex items-center gap-1.5 text-[11px]">
                          <span className="text-slate-400">Status:</span>
                          <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] font-mono ${
                            currentStatus === 'PRESENT'
                              ? 'text-emerald-700 bg-emerald-100 border border-emerald-300'
                              : currentStatus === 'ABSENT'
                              ? 'text-rose-700 bg-rose-100 border border-rose-300'
                              : 'text-slate-700 bg-slate-200 border border-slate-300'
                          }`}>
                            {currentStatus}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Three Action Pill Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleMark(cls, 'PRESENT')}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          currentStatus === 'PRESENT'
                            ? 'bg-emerald-600 text-white font-semibold shadow-xs scale-105'
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </button>

                      <button
                        onClick={() => handleMark(cls, 'ABSENT')}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          currentStatus === 'ABSENT'
                            ? 'bg-rose-600 text-white font-semibold shadow-xs scale-105'
                            : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </button>

                      <button
                        onClick={() => handleMark(cls, 'CANCELLED')}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          currentStatus === 'CANCELLED'
                            ? 'bg-slate-700 text-white font-semibold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                        }`}
                        title="Class was cancelled (excluded from conducted count)"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancelled</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
