import React from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  ArrowRight, 
  BellRing, 
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateRiskStatus, getAttendanceThreshold } from '../services/attendanceStorage';

export default function RiskAlerts({ subjects = [], sectionId = 'III-ECE-B' }) {
  const threshold = getAttendanceThreshold();

  if (!subjects || subjects.length === 0) return null;

  // Classify each subject into CRITICAL, WARNING, or SAFE
  const classifiedSubjects = subjects.map(s => {
    const currentPct = s.currentAttendance || s.percentage || 0;
    const isDetention = s.status === 'IRREVERSIBLE_DETENTION';
    const risk = calculateRiskStatus(currentPct, threshold, isDetention);
    
    // Classes needed to recover
    const classesToRecover = s.target75?.requiredToAttend ?? s.requiredFor75 ?? 0;
    const safeMisses = s.target75?.safeToMiss ?? s.safeToMiss75 ?? 0;

    let actionAdvice = '';
    if (risk.status === 'CRITICAL') {
      actionAdvice = classesToRecover > 0 
        ? `Attend next ${classesToRecover} consecutive classes to escape detention.`
        : 'Immediately seek On-Duty (OD) approval or medical exemption.';
    } else if (risk.status === 'WARNING') {
      actionAdvice = `Buffer is fragile. Only ${safeMisses} safe miss(es) remaining.`;
    } else {
      actionAdvice = `Safe buffer: You can safely miss up to ${safeMisses} class(es).`;
    }

    return {
      ...s,
      currentPct,
      risk,
      classesToRecover,
      safeMisses,
      actionAdvice
    };
  });

  const criticalList = classifiedSubjects.filter(s => s.risk.status === 'CRITICAL');
  const warningList = classifiedSubjects.filter(s => s.risk.status === 'WARNING');
  const safeList = classifiedSubjects.filter(s => s.risk.status === 'SAFE');

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-amber-600" />
              <span>Attendance Risk Alerts</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-medium">
              Threshold: {threshold}%
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-1">
            Automated Academic Standing & Risk Analysis
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium">
          {criticalList.length > 0 && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              {criticalList.length} Critical
            </span>
          )}
          {warningList.length > 0 && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {warningList.length} Warning
            </span>
          )}
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {safeList.length} Safe
          </span>
        </div>
      </div>

      {/* Critical Alerts Group */}
      {criticalList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Critical Shortage — Below {threshold}% Threshold</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criticalList.map(s => (
              <div 
                key={s.code} 
                className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-semibold">
                      CRITICAL
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1.5 tracking-tight">{s.name}</h4>
                    <span className="text-[11px] font-mono text-slate-500">{s.code}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-rose-700 block">{s.currentPct}%</span>
                    <span className="text-[10px] text-slate-500 font-mono">Req: {threshold}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-rose-200/80 text-xs space-y-1 shadow-2xs">
                  <div className="text-rose-700 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{s.classesToRecover} classes needed to recover</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Recommended action: {s.actionAdvice}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <Link
                    to={`/od-simulator?section=${sectionId}`}
                    className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    Simulate OD Rescue &rarr;
                  </Link>

                  <Link
                    to={`/calculator?section=${sectionId}&subject=${s.code}`}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
                  >
                    Calculate Plan &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Alerts Group */}
      {warningList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Warning — Close to Minimum Required Attendance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {warningList.map(s => (
              <div 
                key={s.code} 
                className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-semibold">
                      WARNING
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1.5 tracking-tight">{s.name}</h4>
                    <span className="text-[11px] font-mono text-slate-500">{s.code}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-amber-700 block">{s.currentPct}%</span>
                    <span className="text-[10px] text-slate-500 font-mono">Close to {threshold}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-amber-200/80 text-xs space-y-1 shadow-2xs">
                  <p className="text-slate-700 font-medium">
                    "{s.name} attendance is close to the minimum required percentage."
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium">
                    {s.actionAdvice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe Standing Group */}
      {safeList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Safe Standing — Comfortably Above {threshold}%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {safeList.map(s => (
              <div 
                key={s.code} 
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 truncate max-w-[150px]">{s.name}</span>
                  <span className="font-mono text-xs font-bold text-emerald-600">{s.currentPct}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="text-emerald-700 font-medium">SAFE</span>
                  <span className="font-mono">{s.safeMisses} skips left</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
