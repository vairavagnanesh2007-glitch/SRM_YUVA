import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Calendar, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Copy, 
  Check, 
  Download, 
  Award,
  Layers,
  HeartPulse
} from 'lucide-react';
import { getSections, simulateOD } from '../services/api';
import confetti from 'canvas-confetti';

export default function ODSimulatorPage() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('III-ECE-B');
  const [leaveType, setLeaveType] = useState('ON_DUTY');
  const [startDate, setStartDate] = useState('2026-10-05');
  const [endDate, setEndDate] = useState('2026-10-07');
  const [reason, setReason] = useState('Overworld Hackathon Round 1 & Project Exhibition');
  const [policy, setPolicy] = useState('CONVERT_TO_ATTENDED');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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

  // Run initial simulation
  useEffect(() => {
    if (selectedSection) {
      handleSimulate();
    }
  }, [selectedSection]);

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await simulateOD({
        sectionId: selectedSection,
        leaveType: leaveType,
        startDate: startDate,
        endDate: endDate,
        reason: reason,
        policy: policy,
        referenceToday: '2026-09-28'
      });
      setResult(data);

      if (data.summary?.detentionRescuedCount > 0) {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to simulate OD. Please check dates and backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (days, presetReason) => {
    const start = new Date('2026-10-05');
    const end = new Date(start);
    end.setDate(start.getDate() + (days - 1));

    const sStr = start.toISOString().split('T')[0];
    const eStr = end.toISOString().split('T')[0];

    setStartDate(sStr);
    setEndDate(eStr);
    if (presetReason) setReason(presetReason);
  };

  const handleCopyLetter = () => {
    if (!result?.officialLetter) return;
    navigator.clipboard.writeText(result.officialLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200 mb-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>Phase 2 Feature • Leave Management Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <FileCheck2 className="w-8 h-8 text-cyan-600" />
              <span>On-Duty (OD) & Medical Leave Simulator</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Instantly recalculate final attendance percentages, rescue courses from detention, and draft official approval letters.
            </p>
          </div>

          {/* Section dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase text-slate-500 font-semibold">Class:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.year})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Controls Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" />
              <span>Configure Leave Application Parameters</span>
            </h2>
            
            {/* Quick presets */}
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="text-slate-500 self-center hidden sm:inline text-[11px] font-semibold">Presets:</span>
              <button
                onClick={() => handleQuickPreset(1, "1-Day Academic Workshop")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold transition-colors"
              >
                1 Day (Workshop)
              </button>
              <button
                onClick={() => handleQuickPreset(3, "3-Day National Hackathon")}
                className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 font-semibold transition-colors"
              >
                3 Days (Hackathon)
              </button>
              <button
                onClick={() => handleQuickPreset(5, "Hospitalization / Medical Leave")}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-semibold transition-colors"
              >
                5 Days (Medical)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Leave Type */}
            <div>
              <label className="text-xs font-mono text-slate-600 block mb-1.5 uppercase tracking-wider font-semibold">
                Leave Category
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-medium"
              >
                <option value="ON_DUTY">On-Duty (OD) — Sports / Hackathon</option>
                <option value="MEDICAL_LEAVE">Medical Leave (ML) — Sick Leave</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-xs font-mono text-slate-600 block mb-1.5 uppercase tracking-wider font-semibold">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                min="2026-08-29"
                max="2026-11-29"
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="text-xs font-mono text-slate-600 block mb-1.5 uppercase tracking-wider font-semibold">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max="2026-11-29"
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* University Policy */}
            <div>
              <label className="text-xs font-mono text-slate-600 block mb-1.5 uppercase tracking-wider font-semibold">
                Regulatory Policy
              </label>
              <select
                value={policy}
                onChange={(e) => setPolicy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-medium"
              >
                <option value="CONVERT_TO_ATTENDED">Convert to Attended (Credit Mode)</option>
                <option value="EXEMPT_FROM_CONDUCTED">Exempt from Conducted (Deduct Mode)</option>
              </select>
            </div>
          </div>

          {/* Reason Input & Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State official reason (e.g. Overworld Hackathon, Symposium, Medical Certificate)..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="mobbin-btn-primary flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Recalculate OD Impact</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Top Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Instructional Days</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {result.dateRange?.academicDays} Days
                </span>
                <span className="text-[10px] font-mono text-slate-500">Excludes holidays</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Approved Contact Periods</span>
                <span className="text-2xl font-bold font-mono text-cyan-700 mt-1 block">
                  {result.totalPeriodsApproved} Periods
                </span>
                <span className="text-[10px] font-mono text-slate-500">Across all scheduled courses</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Detention Rescues</span>
                <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-emerald-600" />
                  {result.summary?.detentionRescuedCount} Courses
                </span>
                <span className="text-[10px] font-mono text-slate-500">Saved from &lt; 75% zone</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Application Status</span>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mt-2">
                  APPROVED ESTIMATE
                </span>
              </div>
            </div>

            {/* Subject Impact Comparison Cards */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Subject-by-Subject Attendance Recalculation
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500 font-semibold">
                  {result.subjectImpacts?.length} Courses Analyzed
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {result.subjectImpacts?.map((subj) => {
                  const delta = subj.impact?.attendanceDelta;
                  const isRescued = subj.impact?.detentionRescued;

                  return (
                    <div key={subj.subjectCode} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      
                      {/* Course details */}
                      <div className="space-y-1 max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {subj.subjectCode}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                            Slot {subj.slot || '-'}
                          </span>
                          {isRescued && (
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse">
                              🎉 RESCUED FROM DETENTION!
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900">
                          {subj.subjectName}
                        </h4>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Faculty: {subj.faculty || 'Department Faculty'} • {subj.odPeriodsCount} OD periods
                        </div>
                      </div>

                      {/* Before vs After Metric Grid */}
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono">
                        {/* Attendance Percentage Transition */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[140px]">
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Attendance Transition</span>
                          <div className="flex items-center justify-center gap-2 mt-0.5">
                            <span className="text-slate-500">{subj.baseline?.attendancePercentage}%</span>
                            <ArrowRight className="w-3 h-3 text-cyan-600" />
                            <span className="text-slate-900 font-bold text-sm">{subj.postLeave?.attendancePercentage}%</span>
                          </div>
                          {delta > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                              +{delta}% boost
                            </span>
                          )}
                        </div>

                        {/* Safe misses transition */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[120px]">
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Safe Skips Budget</span>
                          <div className="flex items-center justify-center gap-1.5 mt-0.5">
                            <span className="text-slate-500">{subj.baseline?.safeToMiss75}</span>
                            <ArrowRight className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">{subj.postLeave?.safeToMiss75} skips</span>
                          </div>
                        </div>

                        {/* Status Transition Badge */}
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block mb-1 font-semibold">Eligibility Status</span>
                          <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                            subj.postLeave?.status === 'SAFE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {subj.postLeave?.statusLabel || subj.postLeave?.status}
                          </span>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Application Letter Draft */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-emerald-600" />
                    <span>Official On-Duty Application Draft</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pre-filled formal letter ready to print or submit to the Head of Department.
                  </p>
                </div>

                <button
                  onClick={handleCopyLetter}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-mono text-slate-700 font-semibold transition-colors border border-slate-200"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Application'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {result.officialLetter}
              </pre>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
