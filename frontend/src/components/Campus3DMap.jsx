import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Clock, 
  Users, 
  Wind, 
  Tv, 
  Volume2, 
  ChevronRight, 
  RotateCw, 
  Compass,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Maximize2
} from 'lucide-react';

export default function Campus3DMap({ rooms, selectedFloor, onSelectFloor, onSelectRoom }) {
  const [viewMode, setViewMode] = useState('tower'); // 'tower' | 'slice' | 'blueprint'
  const [cameraPerspective, setCameraPerspective] = useState('isometric'); // 'isometric' | 'elevation' | 'plan'
  const [activeFloor, setActiveFloor] = useState(selectedFloor ? parseInt(selectedFloor) : 1);
  const [hoveredFloor, setHoveredFloor] = useState(null);
  const [hoveredRoom, setHoveredRoom] = useState(null);

  // Synchronize when parent changes floor
  React.useEffect(() => {
    if (selectedFloor) {
      setActiveFloor(parseInt(selectedFloor));
    }
  }, [selectedFloor]);

  const floors = [7, 6, 5, 4, 3, 2, 1];
  const floorData = {
    7: { label: 'Level 7', desc: 'Faculty Suites & Boardroom', height: '3.2m', primaryRooms: ['IST 710'] },
    6: { label: 'Level 6', desc: 'Graduate Research Seminars', height: '3.4m', primaryRooms: ['IST 602'] },
    5: { label: 'Level 5', desc: 'SEEE Lecture Auditoriums', height: '3.8m', primaryRooms: ['IST 509', 'IST 518', 'IST 519'] },
    4: { label: 'Level 4', desc: 'Signal Processing & Labs', height: '3.4m', primaryRooms: ['IST 411', 'IST 416'] },
    3: { label: 'Level 3', desc: 'Robotics & Hardware Labs', height: '3.4m', primaryRooms: ['IST 301', 'IST 305'] },
    2: { label: 'Level 2', desc: 'ECE Smart Classrooms', height: '3.6m', primaryRooms: ['IST 211', 'IST 225', 'IST 227'] },
    1: { label: 'Ground Floor', desc: 'Atrium & Seminar Halls', height: '4.2m', primaryRooms: ['IST 101', 'IST 102', 'IST 105'] },
  };

  const currentFloorRooms = rooms.filter(r => r.floor === activeFloor);

  const getStatusColor = (status) => {
    switch (status) {
      case 'FREE':
        return {
          theme: 'emerald',
          dotBg: 'bg-emerald-500',
          dotShadow: 'shadow-[0_0_8px_rgba(16,185,129,0.7)]',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          wall: 'border-emerald-400/80 bg-emerald-500/10',
          roof: 'bg-emerald-500/15 border-emerald-400',
          label: 'Available'
        };
      case 'ENDING_SOON':
        return {
          theme: 'amber',
          dotBg: 'bg-amber-500',
          dotShadow: 'shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          wall: 'border-amber-400/80 bg-amber-500/10',
          roof: 'bg-amber-500/20 border-amber-400',
          label: 'Ending Soon'
        };
      case 'OCCUPIED':
      default:
        return {
          theme: 'slate',
          dotBg: 'bg-rose-500',
          dotShadow: 'shadow-xs',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          wall: 'border-slate-300 bg-slate-100/80',
          roof: 'bg-slate-200/90 border-slate-300',
          label: 'In Session'
        };
    }
  };

  const getCameraTransform = () => {
    if (cameraPerspective === 'elevation') {
      return {
        transform: 'rotateX(15deg) rotateY(0deg) rotateZ(0deg)',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
      };
    }
    if (cameraPerspective === 'plan') {
      return {
        transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
      };
    }
    // Default Isometric 3D
    return {
      transform: 'rotateX(52deg) rotateZ(-34deg) rotateY(0deg)',
      transformStyle: 'preserve-3d',
      transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-xs">
      
      {/* 3D Model Header Controls */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                IST Building 3D Spatial Model
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                7 Floors Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Select any floor or room to inspect live timetable bookings and start countdown
            </p>
          </div>
        </div>

        {/* View Mode & Camera Selectors */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700">
            <button
              onClick={() => setViewMode('tower')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'tower'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3D Building Tower
            </button>
            <button
              onClick={() => setViewMode('slice')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'slice'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Floor Level Slice
            </button>
          </div>

          {/* Camera Perspective Angle */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700">
            <button
              onClick={() => setCameraPerspective('isometric')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                cameraPerspective === 'isometric'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Isometric
            </button>
            <button
              onClick={() => setCameraPerspective('elevation')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                cameraPerspective === 'elevation'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Elevation
            </button>
          </div>
        </div>
      </div>

      {/* Status Legend Bar */}
      <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-700">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">Status Indicators:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            <span className="font-semibold text-emerald-800">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="font-semibold text-amber-800">Ending Soon (&lt;30m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-600">Occupied</span>
          </div>
        </div>

        {/* Floor Quick Navigation Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <span className="text-slate-400 font-semibold mr-1 shrink-0 text-[11px]">Floor:</span>
          {[1, 2, 3, 4, 5, 6, 7].map(f => {
            const isSelected = activeFloor === f;
            return (
              <button
                key={f}
                onClick={() => {
                  setActiveFloor(f);
                  onSelectFloor(f);
                  setViewMode('slice');
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f === 1 ? 'GF' : `L${f}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D CANVAS VIEWPORT */}
      <div className="relative min-h-[480px] bg-[#f8fafc] p-6 flex flex-col justify-center items-center overflow-hidden perspective-stage">
        
        {/* Architectural Background Grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* VIEW 1: 3D BUILDING TOWER (FULL 7-STORY ARCHITECTURAL MODEL) */}
        {viewMode === 'tower' && (
          <div 
            className="w-full max-w-2xl py-6 my-auto flex flex-col items-center justify-center transition-all duration-500"
            style={getCameraTransform()}
          >
            {/* The 7-Floor Vertical Stack */}
            <div className="w-full flex flex-col gap-3 relative" style={{ transformStyle: 'preserve-3d' }}>
              
              {floors.map(floorNum => {
                const floorRooms = rooms.filter(r => r.floor === floorNum);
                const freeCount = floorRooms.filter(r => r.status === 'FREE').length;
                const endingCount = floorRooms.filter(r => r.status === 'ENDING_SOON').length;
                const occupiedCount = floorRooms.filter(r => r.status === 'OCCUPIED').length;
                const isCurrent = activeFloor === floorNum;
                const isHovered = hoveredFloor === floorNum;

                // Overall floor status glow
                const hasFree = freeCount > 0;
                const hasEnding = endingCount > 0;
                const floorStatusColor = hasEnding 
                  ? 'border-amber-400 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/70 shadow-amber-200/50' 
                  : hasFree 
                  ? 'border-emerald-400 bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/70 shadow-emerald-200/50' 
                  : 'border-slate-200 bg-white/95 shadow-slate-200/40';

                return (
                  <div
                    key={floorNum}
                    onClick={() => {
                      setActiveFloor(floorNum);
                      onSelectFloor(floorNum);
                      setViewMode('slice');
                    }}
                    onMouseEnter={() => setHoveredFloor(floorNum)}
                    onMouseLeave={() => setHoveredFloor(null)}
                    style={{
                      transform: isHovered 
                        ? 'translateZ(24px) scale(1.02)' 
                        : isCurrent 
                        ? 'translateZ(14px)' 
                        : 'translateZ(0px)',
                      transformStyle: 'preserve-3d',
                      transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                    className={`cursor-pointer rounded-2xl border-2 p-3.5 transition-all shadow-md flex items-center justify-between ${floorStatusColor} ${
                      isCurrent ? 'ring-2 ring-indigo-500/30' : ''
                    }`}
                  >
                    {/* Floor Identification Plate */}
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isCurrent ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {floorNum === 1 ? 'GF' : `L${floorNum}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {floorData[floorNum].label}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({floorData[floorNum].desc})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                          <span>Rooms: {floorRooms.map(r => r.name).join(', ') || 'No Classes'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Floor Color-Coded Availability Badges */}
                    <div className="flex items-center gap-2">
                      {freeCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{freeCount} Free</span>
                        </span>
                      )}

                      {endingCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>{endingCount} Ending</span>
                        </span>
                      )}

                      {occupiedCount > 0 && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <span>{occupiedCount} Occupied</span>
                        </span>
                      )}

                      <span className="text-xs font-semibold text-indigo-600 ml-1 flex items-center">
                        Slice <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Concrete Ground Shadow */}
              <div 
                className="h-6 bg-slate-400/20 blur-md rounded-full mt-2 pointer-events-none"
                style={{ transform: 'translateZ(-20px)' }}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: SINGLE FLOOR SLICE (VOLUMETRIC ROOMS & INTERIOR CORRIDOR) */}
        {viewMode === 'slice' && (
          <div 
            className="w-full max-w-3xl py-6 my-auto flex items-center justify-center transition-all duration-500"
            style={getCameraTransform()}
          >
            {/* The Concrete Floor Slab Plate */}
            <div 
              className="relative w-full rounded-3xl p-6 sm:p-8 border-4 border-slate-300 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 shadow-2xl"
              style={{
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Floor Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">
                      {floorData[activeFloor].label} Floor Plan
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                      {floorData[activeFloor].desc}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    Click any classroom to see countdown and summon the squad
                  </span>
                </div>

                <button
                  onClick={() => setViewMode('tower')}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
                >
                  Back to Tower View
                </button>
              </div>

              {/* Central Corridor Pathway Blueprint */}
              <div 
                className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-12 bg-slate-200/60 rounded-xl border border-dashed border-slate-300 flex items-center justify-between px-6 text-[10px] font-mono text-slate-400 pointer-events-none"
                style={{ transform: 'translateZ(1px)' }}
              >
                <span>WEST STAIRS</span>
                <span>CENTRAL CORRIDOR</span>
                <span>EAST ELEVATORS</span>
              </div>

              {/* Volumetric Room Pods on This Floor */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10" style={{ transformStyle: 'preserve-3d' }}>
                {currentFloorRooms.map(room => {
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
                          ? 'translateZ(26px) translateY(-6px)' 
                          : 'translateZ(8px)',
                        transformStyle: 'preserve-3d',
                        transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                      }}
                      className={`cursor-pointer group relative rounded-2xl border-2 p-4 bg-white/95 backdrop-blur-md transition-all shadow-md ${colors.wall}`}
                    >
                      {/* Room Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                              {room.name}
                            </h4>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {room.floorLabel.replace('Floor', 'F')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{room.type}</p>
                        </div>

                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${colors.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dotBg} ${colors.dotShadow}`} />
                          <span>{colors.label}</span>
                        </span>
                      </div>

                      {/* Specifications Strip */}
                      <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 my-2 space-y-1 text-xs text-slate-600">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-medium">Capacity</span>
                          <span className="font-bold text-slate-800">{room.capacity} Desks</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
                          {room.hasAC ? (
                            <span className="text-sky-700 font-semibold flex items-center gap-1">
                              <Wind className="w-3 h-3 text-sky-500" /> AC
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
                            <span className="text-slate-400">No Projector</span>
                          )}
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{room.quietRating}</span>
                        </div>
                      </div>

                      {/* Status / Timing */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        {room.status === 'FREE' ? (
                          <div className="font-bold text-emerald-700 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Free until {room.freeUntil}</span>
                          </div>
                        ) : room.status === 'ENDING_SOON' ? (
                          <div className="font-bold text-amber-700 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>{room.countdownText} left</span>
                          </div>
                        ) : (
                          <div className="text-slate-500 truncate max-w-[150px]">
                            Until {room.freeUntil}
                          </div>
                        )}

                        <span className="text-[11px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                          Inspect <ChevronRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Slab Edge Shadow */}
              <div 
                className="absolute -bottom-6 left-8 right-8 h-6 bg-slate-400/20 blur-md rounded-full pointer-events-none -z-10"
                style={{ transform: 'translateZ(-20px)' }}
              />
            </div>
          </div>
        )}

        {/* View Switcher Quick Floating Bar */}
        <div className="absolute bottom-4 right-5 z-20 flex items-center gap-2 text-xs">
          <button
            onClick={() => setCameraPerspective(cameraPerspective === 'isometric' ? 'elevation' : 'isometric')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold shadow-2xs transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Toggle Angle ({cameraPerspective})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
