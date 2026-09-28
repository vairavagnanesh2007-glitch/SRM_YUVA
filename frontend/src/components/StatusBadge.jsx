import React from 'react';
import { ShieldCheck, AlertTriangle, Flame, Skull } from 'lucide-react';

export default function StatusBadge({ status, statusLabel, size = "md" }) {
  const configs = {
    SAFE: {
      bg: "bg-emerald-950/40 border-emerald-500/40 text-emerald-400",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.25)]",
      icon: ShieldCheck,
      badgeText: "SAFE ZONE",
      desc: "Attendance is >= 90%. Academic honors & exam clearance secured."
    },
    WATCH: {
      bg: "bg-amber-950/40 border-amber-500/40 text-amber-400",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]",
      icon: AlertTriangle,
      badgeText: "WATCH ZONE",
      desc: "Attendance between 75% and 89%. Above detention but below 90% target."
    },
    DANGER: {
      bg: "bg-orange-950/50 border-orange-500/60 text-orange-400",
      glow: "shadow-[0_0_25px_rgba(249,115,22,0.35)]",
      icon: Flame,
      badgeText: "DANGER ZONE",
      desc: "Below mandatory 75% mark! Active recovery plan required."
    },
    IRREVERSIBLE_DETENTION: {
      bg: "bg-red-950/70 border-red-500 text-red-400 animate-pulse",
      glow: "shadow-[0_0_35px_rgba(239,68,68,0.5)]",
      icon: Skull,
      badgeText: "IRREVERSIBLE DETENTION",
      desc: "Mathematically impossible to reach 75% even with 100% attendance."
    }
  };

  const cfg = configs[status] || configs.WATCH;
  const Icon = cfg.icon;

  if (size === "lg") {
    return (
      <div className={`p-4 rounded-xl border ${cfg.bg} ${cfg.glow} transition-all`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-black/40 border border-current">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-xs tracking-wider uppercase font-bold">
                {cfg.badgeText}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-current/30 uppercase">
                STATUS ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 font-medium">
              {cfg.desc}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${cfg.bg} ${cfg.glow}`}>
      <Icon className="h-4 w-4" />
      <span className="font-mono">{statusLabel || cfg.badgeText}</span>
    </div>
  );
}
