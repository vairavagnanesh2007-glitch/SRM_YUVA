import React, { useState, useEffect } from 'react';
import { 
  CalendarRange, 
  Calendar, 
  Clock, 
  BookOpen, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { getSections, calculateLeaveImpact } from '../services/api';
import { 
  getLeavePlans, 
  saveLeavePlan, 
  deleteLeavePlan, 
  getAttendanceThreshold 
} from '../services/attendanceStorage';

export default function LeavePlannerPage() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('III-ECE-B');
  const threshold = getAttendanceThreshold();

  // Form Inputs
  const [startDate, setStartDate] = useState('2026-10-05');
  const [endDate, setEndDate] = useState('2026-10-07');
  const [reason, setReason] = useState('Hackathon Attendance');

  // Calculation & State
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [editingPlanId, setEditingPlanId] = useState(null);

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
    refreshPlans();
  }, []);

  const refreshPlans = () => {
    const plans = getLeavePlans(selectedSection);
    setSavedPlans(plans);
  };

  useEffect(() => {
    refreshPlans();
  }, [selectedSection]);

  // Recalculate impact whenever dates or section changes
  useEffect(() => {
    if (!selectedSection || !startDate || !endDate) return;
    if (validateDates()) {
      runImpactCalculation();
    }
  }, [selectedSection, startDate, endDate]);

  const validateDates = () => {
    setValidationError(null);

    const semStart = new Date('2026-08-29');
    const semEnd = new Date('2026-11-29');
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setValidationError("Start date cannot be after end date.");
      setImpactData(null);
      return false;
    }

    if (start > semEnd || end < semStart) {
      setValidationError("Leave dates must fall within the semester window (Aug 29 – Nov 29, 2026).");
      setImpactData(null);
      return false;
    }

    return true;
  };

  const runImpactCalculation = async () => {
    setLoading(true);
    setValidationError(null);
    try {
      const data = await calculateLeaveImpact({
        sectionId: selectedSection,
        startDate: startDate,
        endDate: endDate,
        reason: reason,
        threshold: threshold,
        referenceToday: '2026-09-28'
      });
      setImpactData(data);
    } catch (err) {
      setValidationError(err.response?.data?.detail || "Could not calculate leave impact.");
      setImpactData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = () => {
    if (!validateDates() || !impactData) return;

    const isOverlapping = savedPlans.some(p => 
      p.id !== editingPlanId &&
      ((startDate >= p.startDate && startDate <= p.endDate) ||
       (endDate >= p.startDate && endDate <= p.endDate))
    );

    if (isOverlapping) {
      if (!window.confirm("This leave plan overlaps with an existing planned leave. Do you still want to save it?")) {
        return;
      }
    }

    const affected = impactData.affectedSubjects || [];
    const avgProjected = affected.length > 0 
      ? Math.round(affected.reduce((acc, s) => acc + s.projectedAttendance, 0) / affected.length * 10) / 10
      : 78.4;

    const res = saveLeavePlan({
      id: editingPlanId,
      sectionId: selectedSection,
      title: reason || "Planned Leave",
      startDate,
      endDate,
      reason,
      affectedClassesCount: impactData.totalClassesPotentiallyMissed,
      projectedOverallAttendance: avgProjected,
      affectedSubjects: affected.map(s => ({
        code: s.subjectCode,
        name: s.subjectName,
        affected: s.classesAffected,
        projected: s.projectedAttendance
      }))
    });

    if (res.success) {
      setSaveSuccessMsg(editingPlanId ? "Leave plan updated successfully!" : "Leave plan saved to upcoming leaves!");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      setEditingPlanId(null);
      refreshPlans();
    }
  };

  const handleEdit = (plan) => {
    setEditingPlanId(plan.id);
    setStartDate(plan.startDate);
    setEndDate(plan.endDate);
    setReason(plan.title);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this leave plan?")) {
      deleteLeavePlan(id);
      refreshPlans();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1550px] mr-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 mb-2 shadow-sm">
              <CalendarRange className="w-3.5 h-3.5 text-amber-500" />
              <span>Leave Planning & Impact Projection</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <span>Student Leave Planner</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Simulate the impact of planned leaves on your attendance before taking time off. Real attendance is <strong>NOT</strong> modified.
            </p>
          </div>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-full px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            {sections.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Input Parameters Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{editingPlanId ? 'Edit Leave Plan' : 'Create Planned Leave'}</span>
            </h2>
            {editingPlanId && (
              <button
                onClick={() => {
                  setEditingPlanId(null);
                  setReason('Personal Leave');
                }}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] text-slate-600 uppercase tracking-wider block mb-1.5 font-semibold">
                Start Date:
              </label>
              <input
                type="date"
                min="2026-08-29"
                max="2026-11-29"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-600 uppercase tracking-wider block mb-1.5 font-semibold">
                End Date:
              </label>
              <input
                type="date"
                min={startDate}
                max="2026-11-29"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-600 uppercase tracking-wider block mb-1.5 font-semibold">
                Reason / Event (Optional):
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Hackathon, Family Function, Medical..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{validationError}</span>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              * Simulation only. No absent records will be marked in your official log.
            </span>

            <button
              onClick={handleSavePlan}
              disabled={loading || Boolean(validationError) || !impactData}
              className="mobbin-btn-primary disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{editingPlanId ? 'Update Leave Plan' : 'Save Leave Plan'}</span>
            </button>
          </div>
        </div>

        {/* Projected Impact Results */}
        {impactData && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">Planned Duration</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {impactData.totalDays} Days
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">{impactData.academicDays} Working Days</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">Classes Affected</span>
                <span className="text-2xl font-bold font-mono text-amber-600 mt-1 block">
                  {impactData.totalClassesPotentiallyMissed} Lectures
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Total missed if absent</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">Courses Impacted</span>
                <span className="text-2xl font-bold font-mono text-slate-800 mt-1 block">
                  {impactData.affectedSubjects?.length} Courses
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Scheduled in this window</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">At-Risk Courses</span>
                <span className={`text-2xl font-bold font-mono mt-1 block ${
                  impactData.atRiskSubjectCount > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {impactData.atRiskSubjectCount} Courses
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Projected &lt; {threshold}%</span>
              </div>
            </div>

            {/* Affected Subject Breakdown Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Subject Projected Attendance & Recovery Impact</span>
                </h3>
                <span className="text-xs text-slate-600 font-mono font-semibold">
                  Threshold: {threshold}%
                </span>
              </div>

              {impactData.affectedSubjects?.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No scheduled classes fall within this date range. Your attendance will remain completely unaffected!</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-mono">
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-3 text-center">Classes Affected</th>
                        <th className="py-3 px-3 text-center">Current %</th>
                        <th className="py-3 px-3 text-center">After Planned Leave</th>
                        <th className="py-3 px-3 text-center">Difference</th>
                        <th className="py-3 px-3 text-center">Classes to Recover</th>
                        <th className="py-3 px-4 text-right">Risk Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {impactData.affectedSubjects?.map(subj => {
                        const isAtRisk = subj.status === 'CRITICAL';
                        const isWarning = subj.status === 'WARNING';

                        return (
                          <tr key={subj.subjectCode} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">{subj.subjectName}</div>
                              <div className="text-[10px] font-mono text-slate-500">{subj.subjectCode}</div>
                            </td>

                            <td className="py-3 px-3 text-center font-mono font-semibold text-amber-600">
                              {subj.classesAffected} classes
                            </td>

                            <td className="py-3 px-3 text-center font-mono text-slate-600">
                              {subj.currentAttendance}%
                            </td>

                            <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                              {subj.projectedAttendance}%
                            </td>

                            <td className="py-3 px-3 text-center font-mono text-rose-600 font-semibold">
                              {subj.difference}%
                            </td>

                            <td className="py-3 px-3 text-center font-mono text-amber-600 font-bold">
                              {subj.classesRequiredToRecover} classes
                            </td>

                            <td className="py-3 px-4 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                                isAtRisk 
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isWarning
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {isAtRisk ? 'CRITICAL (At Risk)' : isWarning ? 'WARNING' : 'SAFE'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Saved Upcoming Leave Plans Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Upcoming Planned Leaves ({savedPlans.length})</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Saved locally
            </span>
          </div>

          {savedPlans.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No upcoming leaves planned yet. Use the form above to schedule planned leaves.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPlans.map(plan => (
                <div 
                  key={plan.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{plan.title}</h4>
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {plan.startDate} &rarr; {plan.endDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                        title="Edit plan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 pt-2 border-t border-slate-200">
                    <div>
                      <span>Potentially Missed:</span>
                      <strong className="text-amber-600 ml-1">{plan.affectedClassesCount} classes</strong>
                    </div>
                    <div>
                      <span>Projected Avg:</span>
                      <strong className="text-slate-900 ml-1">{plan.projectedOverallAttendance}%</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
