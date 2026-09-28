import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { 
  Activity, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Skull, 
  ArrowRight, 
  Download,
  CalendarCheck,
  History,
  CalendarRange
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSections, getSectionDashboard } from '../services/api';
import { exportAttendanceReportPDF } from '../utils/pdfExport';
import RiskAlerts from '../components/RiskAlerts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('III-ECE-B');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    async function loadDashboard() {
      setLoading(true);
      try {
        const data = await getSectionDashboard(selectedSection, '2026-09-28');
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [selectedSection]);

  const handleExportPDF = (subject = null) => {
    if (!dashboardData) return;
    const targetSubj = subject || dashboardData.subjects[0];
    exportAttendanceReportPDF({
      section: {
        id: dashboardData.sectionId,
        name: dashboardData.sectionName,
        venue: dashboardData.venue,
        batch: dashboardData.batch
      },
      subject: {
        code: targetSubj.code,
        name: targetSubj.name,
        faculty: targetSubj.faculty
      },
      calculation: {
        classesConducted: targetSubj.conducted,
        classesAttended: targetSubj.attended,
        classesRemaining: targetSubj.remaining,
        totalSemesterClasses: targetSubj.totalSemesterClasses,
        currentAttendance: targetSubj.currentAttendance,
        maximumPossibleAttendance: targetSubj.maximumPossible,
        target75: targetSubj.target75,
        target90: targetSubj.target90,
        status: targetSubj.status,
        statusLabel: targetSubj.statusLabel,
        explanations: [
          `Overall section average standing: ${dashboardData.summary?.overallAverage}% across ${dashboardData.summary?.totalSubjects} courses.`,
          `Required classes for 75% in this course: ${targetSubj.target75?.requiredToAttend} lectures.`,
          `Safe miss allowance before entering detention: ${targetSubj.target75?.safeToMiss} lectures.`
        ]
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1550px] mr-auto space-y-6">
        
        {/* Header (White Theme) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Subject Health Tracking & Risk Dashboard</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <Layers className="w-8 h-8 text-emerald-600" />
              <span>Semester Attendance Dashboard</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Holistic visual tracking, cross-subject risk analysis, and regulatory compliance graphs.
            </p>
          </div>

          {/* Section dropdown & Export Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-full px-4 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:outline-none"
            >
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.year})</option>
              ))}
            </select>

            <button
              onClick={() => handleExportPDF()}
              className="mobbin-btn-secondary"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-4 bg-white border border-slate-200 rounded-3xl shadow-xs">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-mono">Aggregating visual health charts...</p>
          </div>
        ) : dashboardData && (
          <>
            {/* Top Key Metrics Banner (Clean White Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Average Attendance</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {dashboardData.summary?.overallAverage}%
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">{dashboardData.summary?.totalSubjects} enrolled courses</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Safe Zone (&ge;80%)</span>
                <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  {dashboardData.summary?.safeSubjectsCount}
                </span>
                <span className="text-[11px] text-slate-400">Zero detention risk</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Watch Zone (75-79%)</span>
                <span className="text-2xl font-bold font-mono text-amber-600 mt-1 block flex items-center gap-1.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  {dashboardData.summary?.watchSubjectsCount}
                </span>
                <span className="text-[11px] text-slate-400">Fragile safe miss margin</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Danger Zone (&lt;75%)</span>
                <span className="text-2xl font-bold font-mono text-orange-600 mt-1 block flex items-center gap-1.5">
                  <Flame className="w-5 h-5 text-orange-600" />
                  {dashboardData.summary?.dangerSubjectsCount}
                </span>
                <span className="text-[11px] text-slate-400">Recovery classes required</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Detained (Irreversible)</span>
                <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block flex items-center gap-1.5">
                  <Skull className="w-5 h-5 text-rose-600" />
                  {dashboardData.summary?.detainedSubjectsCount}
                </span>
                <span className="text-[11px] text-slate-400">Max possible &lt; 75%</span>
              </div>
            </div>

            {/* Quick Action Navigation Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Link
                to="/daily-attendance"
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors block">
                      Daily Attendance Marking
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Mark today's classes (P / A / C)
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/history"
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-purple-700 transition-colors block">
                      Attendance History Log
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Audit past records & calendar
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/leave-planner"
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                    <CalendarRange className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-amber-700 transition-colors block">
                      Leave Impact Planner
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Simulate timetable impact
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Attendance Risk Alerts Component */}
            <RiskAlerts 
              subjects={dashboardData.subjects} 
              sectionId={selectedSection} 
            />

            {/* Visual Charts Grid (White Theme) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Bar Chart: Subject Attendance vs 75% and 90% */}
              <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base tracking-tight">Course Attendance vs Cutoff Thresholds</h3>
                    <p className="text-xs text-slate-500">Comparing Current Score against 75% Danger & 90% Distinction lines</p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-mono">
                    <span className="text-amber-600 flex items-center gap-1 font-semibold">--- 75% Cutoff</span>
                    <span className="text-emerald-600 flex items-center gap-1 font-semibold">--- 90% Target</span>
                  </div>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.charts?.barChart} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        formatter={(val, name) => [`${val}%`, name === 'current' ? 'Current Attendance' : 'Max Possible']}
                      />
                      <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} label={{ value: '75%', fill: '#d97706', fontSize: 10 }} />
                      <ReferenceLine y={90} stroke="#10b981" strokeDasharray="4 4" strokeWidth={2} label={{ value: '90%', fill: '#059669', fontSize: 10 }} />
                      <Bar dataKey="current" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Current Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Donut Chart: Health Distribution */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base tracking-tight">Attendance Health Spectrum</h3>
                  <p className="text-xs text-slate-500">Section-wide category distribution</p>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.charts?.distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {dashboardData.charts?.distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Custom Legend */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-100">
                  {dashboardData.charts?.distribution.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                      <span className="text-slate-700 text-[11px] truncate">{entry.name}: <strong>{entry.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Detailed Course Roster Cards */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  All Courses in {dashboardData.sectionName}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Click 'Predict' to run deep simulation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {dashboardData.subjects?.map((subj) => (
                  <div 
                    key={subj.code} 
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-3 group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {subj.code}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                            Slot {subj.slot || '-'}
                          </span>
                        </div>
                        <h4 className="font-semibold text-xs text-slate-800 mt-1 line-clamp-1">
                          {subj.name}
                        </h4>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        subj.status === 'SAFE' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : subj.status === 'WATCH'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {subj.currentAttendance}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                      <div>
                        <span>Safe Skips:</span>
                        <strong className="text-emerald-700 ml-1">{subj.safeToMiss75}</strong>
                      </div>
                      <div>
                        <span>Need 75%:</span>
                        <strong className="text-amber-700 ml-1">{subj.requiredFor75}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => handleExportPDF(subj)}
                        className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={() => navigate(`/calculator?section=${dashboardData.sectionId}&subject=${subj.code}`)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <span>Predict</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}
