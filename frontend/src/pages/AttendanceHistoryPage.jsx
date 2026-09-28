import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Search, 
  Calendar as CalendarIcon, 
  Check, 
  X, 
  Ban, 
  Trash2, 
  BookOpen, 
  ArrowRight
} from 'lucide-react';
import { getSections, getSectionSubjects } from '../services/api';
import { 
  getAttendanceHistory, 
  getSubjectRecordedSummary, 
  deleteAttendanceRecord 
} from '../services/attendanceStorage';

export default function AttendanceHistoryPage() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('III-ECE-B');
  const [subjects, setSubjects] = useState([]);

  // Filters
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST' or 'CALENDAR'

  // Data
  const [records, setRecords] = useState([]);
  const [subjectSummary, setSubjectSummary] = useState({});
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // Load sections on mount
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

  // Load subjects for filter
  useEffect(() => {
    if (!selectedSection) return;
    async function loadSubjs() {
      try {
        const data = await getSectionSubjects(selectedSection);
        setSubjects(data);
      } catch (err) {
        console.error("Failed to load subjects", err);
      }
    }
    loadSubjs();
    refreshData();
  }, [selectedSection, subjectFilter, statusFilter, monthFilter, searchQuery]);

  const refreshData = () => {
    const list = getAttendanceHistory({
      sectionId: selectedSection,
      subjectCode: subjectFilter,
      status: statusFilter,
      month: monthFilter,
      searchQuery: searchQuery
    });
    setRecords(list);

    const summary = getSubjectRecordedSummary(selectedSection);
    setSubjectSummary(summary);
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this attendance record?")) {
      deleteAttendanceRecord(id);
      refreshData();
    }
  };

  // Group records by Date for the list view
  const groupedRecords = React.useMemo(() => {
    const groups = {};
    records.forEach(r => {
      if (!groups[r.date]) {
        groups[r.date] = [];
      }
      groups[r.date].push(r);
    });
    return groups;
  }, [records]);

  // Calendar dates generation
  const calendarDays = React.useMemo(() => {
    const days = [];
    const start = new Date('2026-08-29');
    const end = new Date('2026-11-29');
    let curr = new Date(start);

    while (curr <= end) {
      const dateStr = curr.toISOString().split('T')[0];
      const monthStr = dateStr.slice(0, 7);

      if (monthFilter === 'ALL' || monthFilter === monthStr) {
        const dayRecords = records.filter(r => r.date === dateStr);
        days.push({
          date: dateStr,
          dayNum: curr.getDate(),
          weekday: curr.toLocaleDateString('en-US', { weekday: 'short' }),
          records: dayRecords,
          present: dayRecords.filter(r => r.status === 'PRESENT').length,
          absent: dayRecords.filter(r => r.status === 'ABSENT').length,
          cancelled: dayRecords.filter(r => r.status === 'CANCELLED').length,
          isWeekend: curr.getDay() === 0 || curr.getDay() === 6
        });
      }
      curr.setDate(curr.getDate() + 1);
    }
    return days;
  }, [records, monthFilter]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <History className="w-3.5 h-3.5 text-emerald-600" />
              <span>Attendance History & Audit Logs</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <span>Attendance History</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Verified chronological records of marked lectures, subject-level breakdowns, and calendar audit view.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/daily-attendance"
              className="mobbin-btn-primary"
            >
              <span>+ Mark Today's Attendance</span>
            </Link>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by course name, code, date, or faculty..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
              >
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none max-w-[170px] truncate"
              >
                <option value="ALL">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Months</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-11">November 2026</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center rounded-full bg-slate-100 border border-slate-200 p-1">
                <button
                  onClick={() => setViewMode('LIST')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    viewMode === 'LIST' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('CALENDAR')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    viewMode === 'CALENDAR' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Calendar
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Subject-Wise Summary Table */}
        {Object.keys(subjectSummary).length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Recorded Subject Attendance Summary</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Calculated strictly from real marked records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Conducted</th>
                    <th className="py-3 px-4">Present</th>
                    <th className="py-3 px-4">Absent</th>
                    <th className="py-3 px-4">Cancelled</th>
                    <th className="py-3 px-4">Current %</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.values(subjectSummary).map((s) => (
                    <tr key={s.subjectCode} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{s.subjectName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{s.subjectCode}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{s.conducted}</td>
                      <td className="py-3 px-4 font-mono font-medium text-emerald-600">{s.attended}</td>
                      <td className="py-3 px-4 font-mono font-medium text-rose-600">{s.absent}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-400">{s.cancelled}</td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={
                          s.percentage >= 80 ? 'text-emerald-600' :
                          s.percentage >= 75 ? 'text-amber-600' : 'text-rose-600'
                        }>
                          {s.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                          s.status === 'SAFE' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : s.status === 'WARNING'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Mode 1: List View */}
        {viewMode === 'LIST' && (
          <div className="space-y-6">
            {records.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
                <History className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Attendance Records Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No records match your selected filters. Mark daily classes from the Daily Attendance tab to build your semester history.
                </p>
                <div className="pt-2">
                  <Link
                    to="/daily-attendance"
                    className="mobbin-btn-primary"
                  >
                    <span>Go to Daily Attendance</span>
                  </Link>
                </div>
              </div>
            ) : (
              Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a)).map((dateStr) => {
                const dayRecords = groupedRecords[dateStr];
                const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });

                return (
                  <div key={dateStr} className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-mono">{dateStr}</span>
                        <span className="text-xs text-slate-500 font-normal">({dayName})</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {dayRecords.length} classes recorded
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dayRecords.map((r) => (
                        <div 
                          key={r.id} 
                          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3 group hover:border-slate-300 transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                Period {r.period}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {r.time}
                              </span>
                            </div>

                            <h4 className="font-semibold text-xs text-slate-900 line-clamp-1">
                              {r.subjectName}
                            </h4>

                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                              <span>{r.subjectCode}</span>
                              {r.faculty && <span>• {r.faculty}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border flex items-center gap-1 ${
                              r.status === 'PRESENT'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : r.status === 'ABSENT'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {r.status === 'PRESENT' && <Check className="w-3 h-3 text-emerald-600" />}
                              {r.status === 'ABSENT' && <X className="w-3 h-3 text-rose-600" />}
                              {r.status === 'CANCELLED' && <Ban className="w-3 h-3 text-slate-500" />}
                              <span>{r.status}</span>
                            </span>

                            <button
                              onClick={() => handleDelete(r.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                              title="Delete this record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* View Mode 2: Interactive Calendar Visualizer */}
        {viewMode === 'CALENDAR' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Semester Attendance Calendar Visualizer
                </span>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" /> Present
                  </span>
                  <span className="flex items-center gap-1 text-rose-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-rose-600" /> Absent
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-slate-400" /> Cancelled
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {calendarDays.map((day) => {
                  const hasRecords = day.records.length > 0;
                  const isSelected = selectedCalendarDate === day.date;

                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedCalendarDate(isSelected ? null : day.date)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        isSelected 
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : hasRecords 
                          ? 'bg-slate-50 border-slate-200 hover:border-slate-300' 
                          : day.isWeekend
                          ? 'bg-slate-50/40 border-slate-100 opacity-40'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold font-mono ${isSelected ? 'text-white' : 'text-slate-900'}`}>{day.dayNum}</span>
                        <span className={`text-[10px] font-mono uppercase ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{day.weekday}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-1 min-h-[16px]">
                        {day.present > 0 && (
                          <span className="text-[10px] px-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-semibold">
                            {day.present}P
                          </span>
                        )}
                        {day.absent > 0 && (
                          <span className="text-[10px] px-1 rounded-full bg-rose-100 text-rose-800 font-mono font-semibold">
                            {day.absent}A
                          </span>
                        )}
                        {day.cancelled > 0 && (
                          <span className="text-[10px] px-1 rounded-full bg-slate-200 text-slate-700 font-mono">
                            {day.cancelled}C
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Calendar Day Inspection Box */}
            {selectedCalendarDate && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Classes on {selectedCalendarDate}
                  </h3>
                  <button 
                    onClick={() => setSelectedCalendarDate(null)}
                    className="text-xs text-slate-500 hover:text-slate-900"
                  >
                    Close Inspection
                  </button>
                </div>

                {records.filter(r => r.date === selectedCalendarDate).length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono">No marked records for this date.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {records.filter(r => r.date === selectedCalendarDate).map((r) => (
                      <div key={r.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 block">Period {r.period} ({r.time})</span>
                          <span className="font-semibold text-xs text-slate-900">{r.subjectName}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                          r.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          r.status === 'ABSENT' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
