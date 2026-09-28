import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Layers, 
  FileCheck2, 
  Calendar, 
  Calculator, 
  CalendarCheck, 
  History, 
  CalendarRange, 
  Menu, 
  X,
  HelpCircle,
  Clock,
  Zap,
  Building2,
  MapPin
} from 'lucide-react';

export default function Navbar({ onOpenDemo, onOpenGuide }) {
  const location = useLocation();
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const semEnd = new Date('2026-11-29T23:59:59');
    const now = new Date();
    const refDate = now > new Date('2026-08-29') && now < semEnd ? now : new Date('2026-09-28');
    const diff = Math.max(0, Math.ceil((semEnd - refDate) / (1000 * 60 * 60 * 24)));
    setDaysRemaining(diff);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Predictor', icon: Calculator },
    { to: '/locator', label: 'Room Locator', icon: Building2, isRound2: true },
    { to: '/daily-attendance', label: 'Daily Mark', icon: CalendarCheck, isNew: true },
    { to: '/history', label: 'History', icon: History, isNew: true },
    { to: '/leave-planner', label: 'Leave Planner', icon: CalendarRange, isNew: true },
    { to: '/dashboard', label: 'Risk & Health', icon: Layers },
    { to: '/od-simulator', label: 'OD Simulator', icon: FileCheck2 },
    { to: '/timetable', label: 'Timetables', icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo (Clean Light Theme) */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-all shadow-xs">
              <Zap className="h-5 w-5 fill-emerald-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-slate-900">
                  Attendance Predictor
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono font-medium">
                  SRM SEEE
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block font-normal -mt-0.5">
                Deterministic Decision Engine
              </span>
            </div>
          </Link>

          {/* Center Navigation (Light Pill Bar) */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to === '/' && location.pathname === '/calculator');
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.isRound2 && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white shadow-xs">
                      R2
                    </span>
                  )}
                  {item.isNew && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Guide Button */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-all shadow-2xs"
              title="Site Guide & Feature Tour"
            >
              <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            {/* Semester Countdown */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              <span>Sem End:</span>
              <span className="font-semibold text-slate-900">29 Nov</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
                {daysRemaining}d
              </span>
            </div>

            {/* Judge Demo Pill CTA */}
            <button
              onClick={onOpenDemo}
              className="mobbin-btn-primary"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Judge Presets</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to === '/' && location.pathname === '/calculator');
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-500" />
                    <span>{item.label}</span>
                  </div>
                  {item.isRound2 && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white">
                      R2
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Semester: Aug 29 – Nov 29, 2026</span>
            <span className="text-slate-900">{daysRemaining} days left</span>
          </div>
        </div>
      )}
    </header>
  );
}
