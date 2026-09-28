import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen, 
  UserCheck, 
  Layers, 
  Search, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { getSections, getSectionTimetable } from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Color mapping for slots in light mode
const SLOT_COLORS = {
  'A': { bg: 'bg-emerald-50/90', border: 'border-emerald-200', text: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-800' },
  'B': { bg: 'bg-sky-50/90', border: 'border-sky-200', text: 'text-sky-900', badge: 'bg-sky-100 text-sky-800' },
  'C': { bg: 'bg-indigo-50/90', border: 'border-indigo-200', text: 'text-indigo-900', badge: 'bg-indigo-100 text-indigo-800' },
  'D': { bg: 'bg-purple-50/90', border: 'border-purple-200', text: 'text-purple-900', badge: 'bg-purple-100 text-purple-800' },
  'E': { bg: 'bg-amber-50/90', border: 'border-amber-200', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-800' },
  'F': { bg: 'bg-rose-50/90', border: 'border-rose-200', text: 'text-rose-900', badge: 'bg-rose-100 text-rose-800' },
  'G': { bg: 'bg-teal-50/90', border: 'border-teal-200', text: 'text-teal-900', badge: 'bg-teal-100 text-teal-800' },
  'DEFAULT': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', badge: 'bg-slate-200 text-slate-700' },
};

export default function TimetablePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(searchParams.get('section') || '');
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedSubjectModal, setSelectedSubjectModal] = useState(null);

  // Load sections on mount
  useEffect(() => {
    async function loadSections() {
      try {
        const data = await getSections();
        setSections(data);
        if (!selectedSectionId && data.length > 0) {
          // Default to III ECE B if available, or first section
          const preferred = data.find(s => s.id === 'III-ECE-B') || data[0];
          setSelectedSectionId(preferred.id);
        }
      } catch (err) {
        console.error("Failed to load sections", err);
      }
    }
    loadSections();
  }, []);

  // Load timetable whenever section changes
  useEffect(() => {
    if (!selectedSectionId) return;
    async function loadTimetable() {
      setLoading(true);
      try {
        const data = await getSectionTimetable(selectedSectionId);
        setTimetableData(data);
        setSearchParams({ section: selectedSectionId }, { replace: true });
      } catch (err) {
        console.error("Failed to load timetable", err);
      } finally {
        setLoading(false);
      }
    }
    loadTimetable();
  }, [selectedSectionId]);

  // Build grid matrix: lookup table by [day][period]
  const scheduleMatrix = React.useMemo(() => {
    if (!timetableData?.subjects) return {};
    const matrix = {};
    DAYS.forEach(d => { matrix[d] = {}; });

    timetableData.subjects.forEach(subject => {
      (subject.schedule || []).forEach(slot => {
        const day = slot.day;
        (slot.periods || []).forEach(p => {
          if (matrix[day]) {
            matrix[day][p] = subject;
          }
        });
      });
    });
    return matrix;
  }, [timetableData]);

  const periods = timetableData?.periods || [
    { period: 1, time: '09:00 - 09:50' },
    { period: 2, time: '09:50 - 10:40' },
    { period: 3, time: '10:50 - 11:40' },
    { period: 4, time: '11:40 - 12:30' },
    { period: 5, time: '12:30 - 01:20', isLunch: true },
    { period: 6, time: '01:20 - 02:10' },
    { period: 7, time: '02:10 - 03:00' },
    { period: 8, time: '03:10 - 04:00' },
    { period: 9, time: '04:00 - 04:50' }
  ];

  const currentSection = sections.find(s => s.id === selectedSectionId);

  // Filter subjects for roster
  const filteredSubjects = (timetableData?.subjects || []).filter(sub => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return sub.name.toLowerCase().includes(q) || 
           sub.code.toLowerCase().includes(q) || 
           (sub.faculty && sub.faculty.toLowerCase().includes(q));
  });

  const handleNavigateToCalculator = (subjectCode = '') => {
    let url = `/calculator?section=${encodeURIComponent(selectedSectionId)}`;
    if (subjectCode) {
      url += `&subject=${encodeURIComponent(subjectCode)}`;
    }
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Department Timetable Database</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-emerald-600" />
              <span>Class Timetable Explorer</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              SRM Institute of Science & Technology • SEEE • Semester Aug 29 – Nov 29, 2026
            </p>
          </div>

          {/* Section Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 sm:self-center font-semibold">
              Select Class:
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition-colors shadow-sm cursor-pointer min-w-[240px]"
            >
              {sections.map(sec => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} ({sec.year} - Sem {sec.semester})
                </option>
              ))}
            </select>

            <button
              onClick={() => handleNavigateToCalculator()}
              className="mobbin-btn-primary inline-flex items-center justify-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Calculator</span>
            </button>
          </div>
        </div>

        {/* Section Metadata Card */}
        {currentSection && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Class / Section</span>
              <span className="text-base font-bold text-slate-900">{currentSection.name}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Classroom Venue</span>
              <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {timetableData?.venue || currentSection.venue || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Shift / Timing</span>
              <span className="text-sm font-semibold text-indigo-700 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                {timetableData?.timingType === 'AN' ? 'Afternoon (AN)' : 'Forenoon (FN)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Total Subjects</span>
              <span className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                {timetableData?.subjects?.length || 0} Courses
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Student Strength</span>
              <span className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                {currentSection.student_count || 65} Students
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Source Dataset</span>
              <span className="text-xs font-mono text-slate-500 truncate block mt-1" title={currentSection.source_file}>
                {currentSection.source_file || 'timetables.zip'}
              </span>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-mono">Loading authoritative timetable matrix...</p>
          </div>
        ) : (
          <>
            {/* Weekly Timetable Grid */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Weekly Schedule Grid (Periods 1 — 9)
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Click any subject slot to calculate attendance
                </div>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono text-slate-500">
                      <th className="py-3 px-4 w-28 uppercase tracking-wider text-slate-700 font-semibold sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                        Day / Period
                      </th>
                      {periods.map(p => (
                        <th 
                          key={p.period} 
                          className={`py-2 px-2 text-center border-r border-slate-200 last:border-r-0 ${
                            p.isLunch ? 'bg-amber-50/50 min-w-[70px]' : 'min-w-[120px]'
                          }`}
                        >
                          <div className="font-bold text-slate-800">
                            {p.isLunch ? 'LUNCH' : `P${p.period}`}
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            {p.time}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {DAYS.map(day => (
                      <tr key={day} className="hover:bg-slate-50/60 transition-colors">
                        {/* Day Column */}
                        <td className="py-3 px-4 font-bold text-slate-900 bg-white sticky left-0 z-10 border-r border-slate-200 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>{day}</span>
                        </td>

                        {/* Periods Columns */}
                        {periods.map(p => {
                          if (p.isLunch) {
                            return (
                              <td 
                                key={p.period} 
                                className="py-3 px-2 text-center bg-amber-50/30 border-r border-slate-200 text-slate-400 font-mono text-[10px] select-none"
                              >
                                <Coffee className="w-4 h-4 mx-auto mb-1 text-amber-500/60" />
                                Break
                              </td>
                            );
                          }

                          const subject = scheduleMatrix[day]?.[p.period];
                          const colorScheme = subject 
                            ? (SLOT_COLORS[subject.slot] || SLOT_COLORS.DEFAULT)
                            : null;

                          return (
                            <td 
                              key={p.period} 
                              className="py-2 px-2 border-r border-slate-200 last:border-r-0 align-top"
                            >
                              {subject ? (
                                <div
                                  onClick={() => handleNavigateToCalculator(subject.code)}
                                  className={`group p-2 rounded-xl border ${colorScheme.border} ${colorScheme.bg} hover:border-slate-900 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-0.5`}
                                  title={`Click to analyze attendance for ${subject.name}`}
                                >
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${colorScheme.badge}`}>
                                      Slot {subject.slot || '-'}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-900 transition-colors font-semibold">
                                      {subject.code}
                                    </span>
                                  </div>
                                  <div className="font-semibold text-slate-900 line-clamp-2 leading-tight text-[11px] transition-colors">
                                    {subject.name}
                                  </div>
                                  <div className="mt-1 text-[10px] text-slate-500 truncate flex items-center gap-1 font-medium">
                                    <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{subject.faculty || 'Faculty TBA'}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full min-h-[64px] flex items-center justify-center text-[10px] font-mono text-slate-300 select-none">
                                  —
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subject Roster / Course Catalogue */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <span>Course Catalogue & Faculty Roster</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official syllabus and faculty allocations for {currentSection?.name}
                  </p>
                </div>

                {/* Filter / Search input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Search course or faculty..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono text-slate-500 uppercase">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Course Title</th>
                      <th className="py-3 px-3 text-center">Slot</th>
                      <th className="py-3 px-3 text-center">L-T-P-C</th>
                      <th className="py-3 px-4">Faculty Member</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-3 text-center">Weekly Periods</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubjects.map(sub => {
                      const weeklyPeriods = (sub.schedule || []).reduce((acc, s) => acc + (s.periods?.length || 0), 0);
                      const colorScheme = SLOT_COLORS[sub.slot] || SLOT_COLORS.DEFAULT;

                      return (
                        <tr key={sub.code} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {sub.code}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                            {sub.name}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] ${colorScheme.badge}`}>
                              {sub.slot || '-'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-500 font-medium">
                            {sub.credit || '3-0-0-3'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-800 font-medium">
                            {sub.faculty || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {sub.designation || '—'}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-700">
                            {weeklyPeriods} hrs
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleNavigateToCalculator(sub.code)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all shadow-sm"
                            >
                              <span>Predict</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredSubjects.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 font-mono">
                          No matching courses found for "{filterQuery}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
