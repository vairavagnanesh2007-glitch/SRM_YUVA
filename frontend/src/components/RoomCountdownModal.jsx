import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Wind, 
  Tv, 
  Volume2, 
  Calendar, 
  ExternalLink, 
  AlertTriangle,
  Building,
  CheckCircle2,
  Sparkles,
  Zap,
  MapPin
} from 'lucide-react';

export default function RoomCountdownModal({ room, onClose, day = "Monday" }) {
  const [secondsRemaining, setSecondsRemaining] = useState(room ? room.secondsLeft || (room.minutesLeft * 60) : 0);
  const [copied, setCopied] = useState(false);

  // Synchronize when room changes
  useEffect(() => {
    if (room) {
      setSecondsRemaining(room.secondsLeft || (room.minutesLeft * 60));
    }
  }, [room]);

  // Live real-time countdown ticker down to the second
  useEffect(() => {
    if (!room || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [room, secondsRemaining]);

  if (!room) return null;

  // Format countdown into HH:MM:SS
  const formatTime = (totalSeconds) => {
    if (totalSeconds <= 0) return "00:00:00";
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  // Official requirement squad message (clean and professional)
  const squadMessage = `Heading to ${room.name}. It's free until ${room.freeUntil}. Come fast!`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(squadMessage)}`;

  const handleCopySquadMessage = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(squadMessage);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = squadMessage;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Failed to copy squad message:", e);
    }
  };

  const isFree = room.status === 'FREE';
  const isEndingSoon = room.status === 'ENDING_SOON';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-start justify-between relative ${
          isFree 
            ? 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50/30 border-emerald-100' 
            : isEndingSoon 
            ? 'bg-gradient-to-r from-amber-50 via-white to-amber-50/30 border-amber-100'
            : 'bg-gradient-to-r from-slate-50 via-white to-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isFree 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : isEndingSoon 
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {isFree ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Room Available Now</span>
                  </>
                ) : isEndingSoon ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Ending Soon (&lt;30m)</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Currently In Session</span>
                  </>
                )}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {room.building} • {room.floorLabel}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{room.name}</h2>
            <p className="text-xs text-slate-600 mt-0.5">{room.type}</p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* LIVE COUNTDOWN CLOCK BANNER */}
          <div className={`p-5 rounded-2xl border text-center transition-all ${
            isFree
              ? 'bg-emerald-500/5 border-emerald-200'
              : isEndingSoon
              ? 'bg-amber-500/10 border-amber-300'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>{isFree ? 'Time Remaining Until Next Class' : isEndingSoon ? 'Class Commencing Shortly' : 'Time Remaining in Current Class'}</span>
            </div>

            {/* Big Digital Clock */}
            <div className="font-mono font-extrabold text-4xl sm:text-5xl tracking-tight text-slate-900 my-2">
              {formatTime(secondsRemaining)}
            </div>

            <p className="text-xs font-medium text-slate-600">
              {isFree ? (
                <>Guaranteed open study window until <span className="font-bold text-emerald-700">{room.freeUntil}</span> ({room.countdownText})</>
              ) : isEndingSoon ? (
                <span className="inline-flex items-center gap-1 text-amber-800 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Next lecture begins in {Math.ceil(secondsRemaining / 60)} minutes ({room.freeUntil})
                </span>
              ) : (
                <>Occupied by <span className="font-bold">{room.currentBooking?.section || 'Scheduled Class'}</span> until <span className="font-bold">{room.freeUntil}</span></>
              )}
            </p>
          </div>

          {/* ROOM SPECIFICATIONS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Room Specifications</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                <Users className="w-5 h-5 text-indigo-600 mb-1" />
                <span className="font-semibold text-slate-900">{room.capacity} Desks</span>
                <span className="text-[10px] text-slate-500">Seating Capacity</span>
              </div>
              <div className={`p-3 rounded-xl border flex flex-col items-center text-center ${
                room.hasAC ? 'bg-sky-50/50 border-sky-200 text-sky-900' : 'bg-slate-50 border-slate-100 text-slate-600'
              }`}>
                <Wind className={`w-5 h-5 mb-1 ${room.hasAC ? 'text-sky-600' : 'text-slate-400'}`} />
                <span className="font-semibold">{room.hasAC ? 'Air Conditioned' : 'Standard Ventilation'}</span>
                <span className="text-[10px] text-slate-500">Climate Control</span>
              </div>
              <div className={`p-3 rounded-xl border flex flex-col items-center text-center ${
                room.hasProjector ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-slate-100 text-slate-600'
              }`}>
                <Tv className={`w-5 h-5 mb-1 ${room.hasProjector ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="font-semibold">{room.hasProjector ? 'HD Projector' : 'Whiteboard Only'}</span>
                <span className="text-[10px] text-slate-500">Presentation AV</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                <Volume2 className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="font-semibold text-slate-900">{room.quietRating} Level</span>
                <span className="text-[10px] text-slate-500">Focus Index</span>
              </div>
            </div>
          </div>

          {/* NEXT CLASS INFORMATION */}
          {room.nextClass && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Next Scheduled Class ({room.freeUntil})</span>
              </div>
              <div className="text-slate-600">
                <span className="font-bold text-slate-900">{room.nextClass.subjectCode} - {room.nextClass.subjectName}</span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Section: {room.nextClass.section} • Faculty: {room.nextClass.faculty}
                </div>
              </div>
            </div>
          )}

          {/* CALL THE SQUAD FEATURE */}
          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-sm text-slate-900">The "Call the Squad" Feature</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                1-Click WhatsApp
              </span>
            </div>

            {/* Generated WhatsApp Squad Message Preview */}
            <div className="p-3 bg-white rounded-xl border border-indigo-200/80 text-xs text-slate-800 font-mono flex items-center justify-between gap-3 shadow-2xs">
              <span className="line-clamp-2 select-all font-medium">"{squadMessage}"</span>
              <button
                onClick={handleCopySquadMessage}
                className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                title="Copy Squad Message"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>Call Squad on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                onClick={handleCopySquadMessage}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-xs transition-colors ${
                  copied
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Squad Message'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Day: <span className="font-semibold text-slate-700">{day}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
