import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import DemoModal from './components/DemoModal';
import OnboardingGuide from './components/OnboardingGuide';
import PredictorPage from './pages/PredictorPage';
import DashboardPage from './pages/DashboardPage';
import ODSimulatorPage from './pages/ODSimulatorPage';
import TimetablePage from './pages/TimetablePage';
import DailyAttendancePage from './pages/DailyAttendancePage';
import AttendanceHistoryPage from './pages/AttendanceHistoryPage';
import LeavePlannerPage from './pages/LeavePlannerPage';
import AttendanceAdvisor from './components/AttendanceAdvisor';
import { ShieldCheck, Cpu, Terminal, Sparkles } from 'lucide-react';

export default function App() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [presetScenario, setPresetScenario] = useState(null);

  // Check if first-time visitor for onboarding guide
  useEffect(() => {
    const hasSeen = localStorage.getItem('has_seen_onboarding_guide_v1');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsGuideOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelectScenario = (scenario) => {
    setPresetScenario(scenario);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 relative">
        
        {/* Navigation Bar (White Theme) */}
        <Navbar 
          onOpenDemo={() => setIsDemoModalOpen(true)} 
          onOpenGuide={() => setIsGuideOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          <Routes>
            {/* The main root route is directly the Attendance Predictor! */}
            <Route 
              path="/" 
              element={
                <PredictorPage 
                  presetScenario={presetScenario} 
                  onClearPreset={() => setPresetScenario(null)} 
                />
              } 
            />
            <Route 
              path="/calculator" 
              element={
                <PredictorPage 
                  presetScenario={presetScenario} 
                  onClearPreset={() => setPresetScenario(null)} 
                />
              } 
            />
            <Route 
              path="/daily-attendance" 
              element={<DailyAttendancePage />} 
            />
            <Route 
              path="/history" 
              element={<AttendanceHistoryPage />} 
            />
            <Route 
              path="/leave-planner" 
              element={<LeavePlannerPage />} 
            />
            <Route 
              path="/dashboard" 
              element={<DashboardPage />} 
            />
            <Route 
              path="/od-simulator" 
              element={<ODSimulatorPage />} 
            />
            <Route 
              path="/timetable" 
              element={<TimetablePage />} 
            />
            {/* Fallback to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Real Interactive AI Chat Bot with Speech Recognition & Synthesis */}
        <AttendanceAdvisor 
          sectionId="III-ECE-B" 
          currentSubjectCode="21MAB302T" 
          classesConducted={25}
          classesAttended={17}
          attendancePercentage={68.0}
          todayDate="2026-09-28"
        />

        {/* Clean Light Footer */}
        <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800">
                  Overworld Hackathon Round 1 — Attendance Predictor
                </span>
                <p className="text-[11px] text-slate-500">
                  Official Solution for SRM Institute of Science & Technology (SEEE)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Deterministic Math Engine</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Real AI Advisor Bot</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-600" />
                <span>FastAPI Active</span>
              </span>
            </div>

            <div className="text-slate-500 text-[11px]">
              Semester Window: Aug 29 – Nov 29, 2026
            </div>

          </div>
        </footer>

        {/* Judge Demo Presets Modal */}
        <DemoModal
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
          onSelectScenario={(scenario) => {
            handleSelectScenario(scenario);
            if (window.location.pathname !== '/' && window.location.pathname !== '/calculator') {
              window.location.href = '/';
            }
          }}
        />

        {/* Onboarding & Navigation Guidance Tour */}
        <OnboardingGuide
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />

      </div>
    </BrowserRouter>
  );
}
