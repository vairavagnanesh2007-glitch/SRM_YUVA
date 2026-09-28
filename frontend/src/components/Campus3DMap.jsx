import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Clock, 
  Users, 
  Wind, 
  Tv, 
  Volume2, 
  Sparkles,
  ChevronRight,
  Maximize2,
  Compass,
  RotateCw,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Campus3DMap({ rooms, selectedFloor, onSelectFloor, onSelectRoom }) {
  const [cameraAngle, setCameraAngle] = useState('isometric'); // 'isometric' | 'front-tilt' | 'blueprint'
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [activeFloorLevel, setActiveFloorLevel] = useState(selectedFloor ? parseInt(selectedFloor) : 1);

  // Sync active floor level if selectedFloor prop changes
  React.useEffect(() => {
    if (selectedFloor) {
      setActiveFloorLevel(parseInt(selectedFloor));
    }
  }, [selectedFloor]);

  const floors = [1, 2, 3, 4, 5, 6, 7];
  const floorLabels = {
    1: 'Ground Floor • Main Atrium & Labs',
    2: 'Level 2 • ECE Smart Classrooms',
    3: 'Level 3 • Embedded Systems & Robotics',
    4: 'Level 4 • Signal Processing Theatres',
    5: 'Level 5 • SEEE Lecture Auditoriums',
    6: 'Level 6 • Research Seminars',
    7: 'Level 7 • Executive Conference Suites'
  };

  const currentFloorRooms = rooms.filter(r => r.floor === activeFloorLevel);
  // If no rooms on this floor in dataset, fallback to showing all or matching
  const displayRooms = currentFloorRooms.length > 0 ? currentFloorRooms : rooms.slice(0, 3);

  const getStatusColor = (status) => {
    switch (status) {
      case 'FREE':
        return {
          theme: 'emerald',
          border: 'border-emerald-400',
          roofBg: 'bg-emerald-500/15 border-emerald-400/80',
          wallBg: 'bg-emerald-50 border-emerald-300',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          accent: 'text-emerald-700',
          tag: 'AVAILABLE'
        };
      case 'ENDING_SOON':
        return {
          theme: 'amber',
          border: 'border-amber-400',
          roofBg: 'bg-amber-500/20 border-amber-400/90',
          wallBg: 'bg-amber-50 border-amber-300',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-500 animate-ping',
          accent: 'text-amber-700',
          tag: 'EXPIRING'
        };
      case 'OCCUPIED':
      default:
        return {
          theme: 'rose',
          border: 'border-slate-300',
          roofBg: 'bg-slate-200/80 border-slate-300',
          wallBg: 'bg-slate-100/90 border-slate-300',
          glow: 'shadow-xs',
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-rose-500',
          accent: 'text-slate-600',
          tag: 'IN SESSION'
        };
    }
  };

  const getCameraStyle = () => {
    switch (cameraAngle) {
      case 'front-tilt':
        return {
          transform: 'rotateX(30deg) rotateZ(-10deg) scale(0.95)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
        };
      case 'blueprint':
        return {
          transform: 'rotateX(0deg) rotateZ(0deg) scale(1)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
        };
      case 'isometric':
      default:
        return {
          transform: 'rotateX(54deg) rotateZ(-36deg) scale(0.92)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-xs">
      
      {/* 3D Map Top Control Bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                IST Building — 3D Spatial Floor Model
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Architectural CAD
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive 3D volumetric classroom slabs • Click room to summon squad & open countdown
            </p>
          </div>
        </div>

        {/* Camera Angle & Perspective Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setCameraAngle('isometric')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              cameraAngle === 'isometric'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3D Isometric
          </button>
          <button
            onClick={() => setCameraAngle('front-tilt')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              cameraAngle === 'front-tilt'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Front Elevation
          </button>
          <button
            onClick={() => setCameraAngle('blueprint')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              cameraAngle === 'blueprint'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Floor Plan 2D
          </button>
        </div>
      </div>

      {/* Floor Level Bar & Legend */}
      <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Floor Level Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <span className="text-slate-400 font-semibold mr-1 shrink-0">Level:</span>
          {floors.map(f => {
            const floorCount = rooms.filter(r => r.floor === f).length;
            const freeCount = rooms.filter(r => r.floor === f && r.status === 'FREE').length;
            const isCurrent = activeFloorLevel === f;

            return (
              <button
                key={f}
                onClick={() => {
                  setActiveFloorLevel(f);
                  onSelectFloor(f);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{f === 1 ? 'GF' : `L${f}`}</span>
                {freeCount > 0 && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Clean Live Status Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
            <span>Free Now</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Ending Soon (&lt;30m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Occupied</span>
          </div>
        </div>
      </div>

      {/* 3D MAP CANVAS VIEWPORT */}
      <div className="relative min-h-[460px] bg-[#f8fafc] p-6 flex flex-col justify-center items-center overflow-hidden perspective-stage">
        
        {/* Subtle Architectural Grid Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: `linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Active Floor Label Overlay (HUD) */}
        <div className="absolute top-4 left-5 z-20 pointer-events-none">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-md shadow-2xs">
            {floorLabels[activeFloorLevel]}
          </span>
        </div>

        {/* 3D BUILDING FLOOR SLAB */}
        <div 
          className="w-full max-w-4xl py-6 my-auto flex items-center justify-center"
          style={getCameraStyle()}
        >
          {/* Main Architectural Slab Plate */}
          <div 
            className="relative w-full rounded-3xl p-8 border-4 border-slate-300/80 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 transition-all duration-300"
            style={{
              boxShadow: '0 30px 60px -12px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Slab Concrete Thickness Edge (Z-extrusion) */}
            <div 
              className="absolute -bottom-4 left-0 right-0 h-4 bg-slate-300 rounded-b-3xl border-t border-slate-400/40 pointer-events-none"
              style={{
                transform: 'translateZ(-14px)'
              }}
            />

            {/* Central Corridor Pathway (Architectural Blueprint Floor Lines) */}
            <div 
              className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-14 bg-slate-200/60 rounded-xl border border-dashed border-slate-300/80 flex items-center justify-between px-6 text-[10px] font-mono text-slate-400 pointer-events-none"
              style={{ transform: 'translateZ(1px)' }}
            >
              <div className="flex items-center gap-2">
                <span>◀ CORRIDOR NORTH</span>
                <span>•</span>
                <span>FIRE EXIT</span>
              </div>
              <div className="flex items-center gap-2">
                <span>LIFT CORE 01</span>
                <span>•</span>
                <span>CORRIDOR SOUTH ▶</span>
              </div>
            </div>

            {/* VOLUMETRIC 3D ROOM PODS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10" style={{ transformStyle: 'preserve-3d' }}>
              {displayRooms.map(room => {
                const colors = getStatusColor(room.status);
                const isHovered = hoveredRoom === room.id;

                return (
                  <div
                    key={room.id}
                    onClick={() => onSelectRoom(room)}
                    onMouseEnter={() => setHoveredRoom(room.id)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    style={{
                      transform: isHovered 
                        ? 'translateZ(30px) translateY(-8px)' 
                        : 'translateZ(10px)',
                      transformStyle: 'preserve-3d',
                      transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                    className={`cursor-pointer group relative rounded-2xl border-2 p-5 bg-white/95 backdrop-blur-md transition-all ${colors.border} ${colors.glow}`}
                  >
                    {/* 3D Extrusion Side Wall Face (Gives real depth) */}
                    <div 
                      className={`absolute -bottom-3 left-1 right-1 h-3 rounded-b-xl border-b border-x ${colors.wallBg} pointer-events-none transition-all`}
                      style={{
                        transform: 'translateZ(-10px)'
                      }}
                    />

                    {/* Room Roof Glass Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">
                            {room.name}
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {room.floorLabel.replace('Floor', 'F')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{room.type}</p>
                      </div>

                      {/* Status Tag Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${colors.badgeBg}`}>
                        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <span>{colors.tag}</span>
                      </span>
                    </div>

                    {/* Classroom Interior Furniture Schematic */}
                    <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 my-2.5 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">SEATING</span>
                        <span className="font-bold text-slate-800">{room.capacity} Desks</span>
                      </div>
                      
                      {/* Amenity Badges */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
                        {room.hasAC ? (
                          <span className="text-sky-700 font-semibold flex items-center gap-1">
                            <Wind className="w-3 h-3 text-sky-500" /> AC Active
                          </span>
                        ) : (
                          <span className="text-slate-400">Non-AC</span>
                        )}
                        <span className="text-slate-300">•</span>
                        {room.hasProjector ? (
                          <span className="text-indigo-700 font-semibold flex items-center gap-1">
                            <Tv className="w-3 h-3 text-indigo-500" /> Projector
                          </span>
                        ) : (
                          <span className="text-slate-400">Screen TBA</span>
                        )}
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">{room.quietRating} Focus</span>
                      </div>
                    </div>

                    {/* Live Timing / Class Booking Strip */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      {room.status === 'FREE' ? (
                        <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Clear until {room.freeUntil}</span>
                        </div>
                      ) : room.status === 'ENDING_SOON' ? (
                        <div className="flex items-center gap-1.5 font-extrabold text-amber-700 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Only {room.countdownText} left!</span>
                        </div>
                      ) : (
                        <div className="text-slate-500 truncate max-w-[170px]">
                          Booked: <strong className="text-slate-700">{room.currentBooking?.section || 'Class'}</strong>
                        </div>
                      )}

                      <span className="text-[11px] font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center">
                        Inspect <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Floor Foundation Pillars Shadow */}
            <div 
              className="absolute -bottom-8 left-12 right-12 h-6 bg-slate-400/25 blur-md rounded-full pointer-events-none -z-10"
              style={{ transform: 'translateZ(-24px)' }}
            />
          </div>
        </div>

        {/* Bottom Interactive Controls Strip */}
        <div className="absolute bottom-3 right-5 z-20 flex items-center gap-2 text-xs">
          <span className="text-slate-400 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200">
            Level {activeFloorLevel} • {displayRooms.length} Classrooms
          </span>
          <button
            onClick={() => setCameraAngle(cameraAngle === 'isometric' ? 'front-tilt' : 'isometric')}
            className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold shadow-2xs transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tilt Angle</span>
          </button>
        </div>
      </div>
    </div>
  );
}
