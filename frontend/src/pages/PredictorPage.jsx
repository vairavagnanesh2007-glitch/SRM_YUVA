import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  getSections, 
  getSectionSubjects, 
  calculateAttendance 
} from '../services/api';
import StatusBadge from '../components/StatusBadge';
import RecoveryGauge from '../components/RecoveryGauge';
import MathematicalProof from '../components/MathematicalProof';
import ComparisonCard from '../components/ComparisonCard';
import WhatIfSimulator from '../components/WhatIfSimulator';
import { 
  Calculator, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Users, 
  Percent, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Skull,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportAttendanceReportPDF } from '../utils/pdfExport';

export default function PredictorPage({ presetScenario, onClearPreset }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlSection = searchParams.get('section');
  const urlSubject = searchParams.get('subject');

  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(urlSection || '');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(urlSubject || '');

  // Mode: "SIMPLE" or "EXACT"
  const [inputMode, setInputMode] = useState('SIMPLE');
  const [attendancePercentage, setAttendancePercentage] = useState(68);
  const [classesConducted, setClassesConducted] = useState(25);
  const [classesAttended, setClassesAttended] = useState(17);

  // Dates
  const [todayDate, setTodayDate] = useState('2026-09-28');
  const [planningDate, setPlanningDate] = useState('2026-11-29');

  // Calculation Results
  const [calculationResult, setCalculationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load sections on mount
  useEffect(() => {
    const loadSecs = async () => {
      try {
        const data = await getSections();
        setSections(data);
        if (data.length > 0 && !selectedSection) {
          const initialSec = urlSection && data.some(s => s.id === urlSection) ? urlSection : data[0].id;
          setSelectedSection(initialSec);
        }
      } catch (err) {
        setError('Failed to load sections. Ensure backend server is running.');
      }
    };
    loadSecs();
  }, []);

  // Load subjects when section changes
  useEffect(() => {
    if (!selectedSection) return;
    const loadSubjs = async () => {
      try {
        const data = await getSectionSubjects(selectedSection);
        setSubjects(data);
        if (data.length > 0) {
          if (urlSubject && data.some(s => s.code === urlSubject)) {
            setSelectedSubject(urlSubject);
          } else if (!data.some(s => s.code === selectedSubject)) {
            setSelectedSubject(data[0].code);
          }
        }
      } catch (err) {
        console.error('Failed to load subjects', err);
      }
    };
    loadSubjs();
  }, [selectedSection]);

  // Handle Preset Scenarios from Demo Modal
  useEffect(() => {
    if (!presetScenario) return;

    if (presetScenario.sectionId && presetScenario.sectionId !== selectedSection) {
      setSelectedSection(presetScenario.sectionId);
    }
    if (presetScenario.subjectCode) {
      setSelectedSubject(presetScenario.subjectCode);
    }
    if (presetScenario.classesConducted !== undefined && presetScenario.classesAttended !== undefined) {
      setInputMode('EXACT');
      setClassesConducted(presetScenario.classesConducted);
      setClassesAttended(presetScenario.classesAttended);
      setAttendancePercentage(Math.round((presetScenario.classesAttended / presetScenario.classesConducted) * 100));
    } else if (presetScenario.percentage !== undefined) {
      setInputMode('SIMPLE');
      setAttendancePercentage(presetScenario.percentage);
    }
    if (presetScenario.todayDate) {
      setTodayDate(presetScenario.todayDate);
    }
  }, [presetScenario]);

  // Execute calculation on parameters change
  const handleCalculate = async () => {
    if (!selectedSection || !selectedSubject) return;

    setLoading(true);
    setError(null);

    const payload = {
      sectionId: selectedSection,
      subjectCode: selectedSubject,
      todayDate: todayDate,
      planningDate: planningDate,
    };

    if (inputMode === 'EXACT') {
      payload.classesConducted = parseInt(classesConducted) || 0;
      payload.classesAttended = parseInt(classesAttended) || 0;
    } else {
      payload.attendancePercentage = parseFloat(attendancePercentage) || 0;
    }

    try {
      const result = await calculateAttendance(payload);
      setCalculationResult(result);

      if (result.calculation?.status === 'SAFE_HIGH' || result.calculation?.status === 'SAFE_MARGIN') {
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Calculation failed. Please verify your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // Initial calculation once section and subject are ready
  useEffect(() => {
    if (selectedSection && selectedSubject) {
      handleCalculate();
    }
  }, [selectedSection, selectedSubject]);

  const calc = calculationResult?.calculation;

  return (
    <div className="space-y-8 py-8 px-4 sm:px-6 lg:px-8 w-full max-w-[1550px] mr-auto">
      
      {/* Clean User-Friendly Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Deterministic Decision Engine
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              SRM Timetable Ground Truth
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Attendance Predictor & Strategizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose your class section and course to compute your remaining semester roadmap, recovery limits, and safe skip budget.
          </p>
        </div>

        {calc && (
          <StatusBadge status={calc.status} statusLabel={calc.statusLabel} size="md" />
        )}
      </div>

      {/* Calculator Input Form (Clean White Card) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* STEP 1: Select Section */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="h-4 w-4 text-emerald-600" />
              1. Class Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} ({sec.timingType})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 block truncate">
              Room: {sections.find(s => s.id === selectedSection)?.venue || "Verified Classroom"}
            </span>
          </div>

          {/* STEP 2: Select Subject */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
              <BookOpen className="h-4 w-4 text-blue-600" />
              2. Subject Course
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              {subjects.map((subj) => (
                <option key={subj.code} value={subj.code}>
                  [{subj.slot}] {subj.code} — {subj.name}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 block truncate">
              {subjects.find(s => s.code === selectedSubject)?.faculty || "Faculty Assigned"}
            </span>
          </div>

          {/* STEP 3: Reference Date */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
              <CalendarIcon className="h-4 w-4 text-purple-600" />
              3. Today's Date
            </label>
            <input
              type="date"
              min="2026-08-29"
              max="2026-11-29"
              value={todayDate}
              onChange={(e) => setTodayDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:bg-white focus:border-purple-500"
            />
            <span className="text-[11px] text-slate-400 block">
              Reference for completed classes
            </span>
          </div>

          {/* STEP 4: Planning Horizon */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="h-4 w-4 text-amber-600" />
              4. Plan Attendance Until
            </label>
            <input
              type="date"
              min={todayDate}
              max="2026-11-29"
              value={planningDate}
              onChange={(e) => setPlanningDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:bg-white focus:border-amber-500"
            />
            <span className="text-[11px] text-slate-400 block">
              Default: Semester End (29 Nov 2026)
            </span>
          </div>

        </div>

        {/* STEP 5: Attendance Input Mode & Values */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-700 font-semibold uppercase">
                Input Mode:
              </span>
              <div className="flex rounded-full bg-white border border-slate-200 p-0.5">
                <button
                  type="button"
                  onClick={() => setInputMode('SIMPLE')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    inputMode === 'SIMPLE'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Simple Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('EXACT')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    inputMode === 'EXACT'
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Exact (Attended / Conducted)
                </button>
              </div>
            </div>
            <span className="text-[11px] text-slate-500">
              {inputMode === 'SIMPLE' ? 'Enter percentage from ERP portal' : 'Exact counts take mathematical precedence'}
            </span>
          </div>

          {inputMode === 'SIMPLE' ? (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Current Attendance Percentage:</span>
                <span className="text-lg font-bold font-mono text-emerald-600">
                  {attendancePercentage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={attendancePercentage}
                onChange={(e) => setAttendancePercentage(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex flex-wrap gap-2">
                {[55, 65, 68, 75, 85, 92].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAttendancePercentage(v)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">Classes Conducted So Far (C):</label>
                <input
                  type="number"
                  min="0"
                  value={classesConducted}
                  onChange={(e) => setClassesConducted(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">Classes Attended So Far (A):</label>
                <input
                  type="number"
                  min="0"
                  max={classesConducted}
                  value={classesAttended}
                  onChange={(e) => setClassesAttended(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button & Error Messages */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {error ? (
            <div className="flex items-center gap-2 text-rose-600 text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 font-medium">
              * Official integer ceiling formula: ⌈0.75N - ε⌉
            </span>
          )}

          <button
            onClick={() => handleCalculate()}
            disabled={loading}
            className="mobbin-btn-primary ml-auto text-xs px-6 py-3"
          >
            {loading ? (
              <span>Calculating...</span>
            ) : (
              <>
                <span>Calculate Strategy</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

      </section>

      {/* RESULTS DASHBOARD */}
      {calc && (
        <section className="space-y-8 animate-in fade-in duration-300">
          
          {/* Action Bar: Download PDF & Details */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-slate-700">
                Strategy for <strong className="text-slate-900">{calculationResult.subject?.name}</strong> ({calculationResult.subject?.code})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => exportAttendanceReportPDF({
                  section: calculationResult.section,
                  subject: calculationResult.subject,
                  calculation: calc,
                  timeline: calculationResult.timeline
                })}
                className="mobbin-btn-secondary"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Official PDF Report</span>
              </button>
            </div>
          </div>
          
          {/* LOUD IRREVERSIBLE DETENTION ALERT BOX (If triggered) */}
          {calc.status === 'IRREVERSIBLE_DETENTION' && (
            <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-400 text-rose-950 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-600 text-white">
                  <Skull className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
                    CRITICAL WARNING: DETENTION THRESHOLD VIOLATION
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-rose-950">
                    IRREVERSIBLE DETENTION DETECTED
                  </h2>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-rose-800 leading-relaxed font-medium">
                Even if you attend every single remaining class in the semester ({calc.classesRemaining} classes), your final attendance can only reach <strong className="underline">{calc.maximumPossibleAttendance}%</strong>. Recovery to the mandatory 75% threshold is mathematically impossible.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-3 border-t border-rose-200 text-rose-900">
                <div>Current: <strong>{calc.currentAttendance}%</strong></div>
                <div>Remaining: <strong>{calc.classesRemaining}</strong></div>
                <div>Maximum Achievable: <strong>{calc.maximumPossibleAttendance}%</strong></div>
                <div>Deficit Shortfall: <strong>{calc.target75?.requiredToAttend - calc.classesRemaining} class(es)</strong></div>
              </div>
            </div>
          )}

          {/* Core Metric Cards (White Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            
            {/* 1. Current Attendance */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-medium block">Current Score</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 block">
                {calc.currentAttendance}%
              </span>
              <span className="text-[11px] text-slate-500 block">
                {calc.classesAttended} / {calc.classesConducted} attended
              </span>
            </div>

            {/* 2. Remaining Classes */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-medium block">Remaining Classes</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-600 block">
                {calc.classesRemaining}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Scheduled periods
              </span>
            </div>

            {/* 3. Must Attend For 75% */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] text-amber-600 uppercase font-semibold block">Must Attend (75%)</span>
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono block ${
                calc.target75?.possible ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {calc.target75?.possible ? calc.target75?.requiredToAttend : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {calc.target75?.possible ? `Out of ${calc.classesRemaining} remaining` : 'Impossible'}
              </span>
            </div>

            {/* 4. Safe To Miss For 75% */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] text-emerald-600 uppercase font-semibold block">Safe To Miss (75%)</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 block">
                {calc.target75?.safeToMiss}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Permitted absences
              </span>
            </div>

            {/* 5. Must Attend For 90% */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] text-cyan-600 uppercase font-semibold block">Must Attend (90%)</span>
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono block ${
                calc.target90?.possible ? 'text-cyan-600' : 'text-slate-400'
              }`}>
                {calc.target90?.possible ? calc.target90?.requiredToAttend : 'Unreachable'}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {calc.target90?.possible ? `Safe to miss: ${calc.target90?.safeToMiss}` : 'Ceiling < 90%'}
              </span>
            </div>

            {/* 6. Maximum Possible */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">Max Possible</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 block">
                {calc.maximumPossibleAttendance}%
              </span>
              <span className="text-[11px] text-slate-500 block">
                If 100% attended
              </span>
            </div>

          </div>

          {/* Recovery Horizon Progress Gauge */}
          <RecoveryGauge calculation={calc} />

          {/* Strategic Explanations (White Card) */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
              Actionable Directives & Observations
            </span>
            <div className="space-y-2 pt-1 text-xs text-slate-700">
              {calc.explanations?.map((exp, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive What-If Simulator */}
          <WhatIfSimulator calculation={calc} />

          {/* Mathematical Proof */}
          <MathematicalProof proof={calc.formulaProof} calculation={calc} />

          {/* Comparison Card */}
          <ComparisonCard 
            comparison={calculationResult.comparison} 
            calculation={calc} 
          />

          {/* Class Schedule & Timetable Portal Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Timetable Explorer Portal
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Official Class Timetables
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mt-1">Class Schedule & Timings</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Chronological class schedules, period timings (P1–P9), and semester calendar dates are organized in the dedicated Timetable Portal.
              </p>
            </div>

            <button
              onClick={() => navigate(`/timetable?section=${encodeURIComponent(selectedSection)}`)}
              className="mobbin-btn-primary shrink-0 flex items-center gap-2"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Open Timetable Portal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </section>
      )}

    </div>
  );
}
