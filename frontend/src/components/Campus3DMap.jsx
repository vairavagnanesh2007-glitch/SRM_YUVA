import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Eye, 
  Clock, 
  Users, 
  Wind, 
  Tv, 
  Volume2, 
  Sparkles,
  ChevronRight,
  Maximize2
} from 'lucide-react';

export default function Campus3DMap({ rooms, selectedFloor, onSelectFloor, onSelectRoom }) {
  const [viewMode, setViewMode] = useState('isometric'); // 'isometric' | 'blueprint' | 'stacked'
  const [hoveredRoom, setHoveredRoom] = useState(null);

  const floors = [1, 2, 3, 4, 5, 6, 7];
  const floorLabels = {
    1: 'Ground Floor (IST 101-105)',
    2: '2nd Floor (IST 211-227)',
    3: '3rd Floor (IST 301-305)',
    4: '4th Floor (IST 411-416)',
    5: '5th Floor (IST 509-519)',
    6: '6th Floor (IST 602)',
    7: '7th Floor (IST 710)'
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'FREE':
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
          dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
          cubeBg: 'bg-emerald-50 border-emerald-300 hover:border-emerald-500 shadow-emerald-100',
          label: 'Free'
        };
      case 'ENDING_SOON':
        return {
          bg: 'bg-amber-500/10 text-amber-700 border-amber-300',
          dot: 'bg-amber-500 animate-ping shadow-[0_0_8px_rgba(245,158,11,0.5)]',
          cubeBg: 'bg-amber-50 border-amber-300 hover:border-amber-500 shadow-amber-100',
          label: 'Ending Soon'
        };
      case 'OCCUPIED':
      default:
        return {
          bg: 'bg-rose-500/10 text-rose-700 border-rose-300',
          dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
          cubeBg: 'bg-rose-50/60 border-rose-200 hover:border-rose-400 shadow-rose-50',
          label: 'Occupied'
        };
    }
  };

  const visibleRooms = selectedFloor
    ? rooms.filter(r => r.floor === parseInt(selectedFloor))
    : rooms;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* 3D Map Header & Perspective Controls */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-base">IST Building 3D Interactive Map</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Live Spatial Model
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any room pod to inspect live availability & launch countdown timer
            </p>
          </div>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('isometric')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'isometric'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Isometric 3D
          </button>
          <button
            onClick={() => setViewMode('blueprint')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'blueprint'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Floor Blueprint
          </button>
          <button
            onClick={() => setViewMode('stacked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'stacked'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tower Stack (7F)
          </button>
        </div>
      </div>

      {/* Legend & Floor Quick Switcher */}
      <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Status Legend */}
        <div className="flex items-center gap-4">
          <span className="text-slate-400 font-medium">Map Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"></span>
            <span className="text-slate-700 font-medium">🟢 Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-slate-700 font-medium">🟡 Ending Soon (&lt;30m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-700 font-medium">🔴 Occupied</span>
          </div>
        </div>

        {/* Floor selector tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onSelectFloor(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              !selectedFloor
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Floors
          </button>
          {floors.map(f => (
            <button
              key={f}
              onClick={() => onSelectFloor(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedFloor === f
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 1 ? 'GF' : `${f}F`}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Map Canvas Stage */}
      <div className="relative min-h-[440px] bg-gradient-to-b from-slate-50 via-slate-100/40 to-slate-100 p-6 flex flex-col justify-center items-center overflow-x-auto">
        {/* Subtle Architectural Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* VIEW MODE 1: ISOMETRIC 3D FLOORS */}
        {viewMode === 'isometric' && (
          <div 
            className="w-full max-w-4xl py-6 transition-all duration-500"
            style={{
              perspective: '1200px'
            }}
          >
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 transition-transform duration-500"
              style={{
                transform: 'rotateX(20deg) rotateZ(-2deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {visibleRooms.map(room => {
                const badge = getStatusBadge(room.status);
                const isHovered = hoveredRoom === room.id;

                return (
                  <div
                    key={room.id}
                    onClick={() => onSelectRoom(room)}
                    onMouseEnter={() => setHoveredRoom(room.id)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    style={{
                      transform: isHovered ? 'translateZ(24px) translateY(-6px)' : 'translateZ(0px)',
                      transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                    className={`cursor-pointer group relative rounded-xl border p-4 transition-all duration-300 bg-white/95 backdrop-blur-xs ${
                      room.status === 'FREE'
                        ? 'border-emerald-300 hover:border-emerald-500 shadow-md shadow-emerald-500/10'
                        : room.status === 'ENDING_SOON'
                        ? 'border-amber-300 hover:border-amber-500 shadow-md shadow-amber-500/10'
                        : 'border-slate-200 hover:border-rose-300 shadow-sm opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Isometric Shadow / Elevation Base */}
                    <div 
                      className={`absolute -inset-0.5 rounded-xl -z-10 blur-xs opacity-60 transition-opacity ${
                        room.status === 'FREE' ? 'bg-emerald-400' : room.status === 'ENDING_SOON' ? 'bg-amber-400' : 'bg-slate-300'
                      }`}
                    />

                    {/* Top Room Banner */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                            {room.name}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {room.floorLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{room.type}</p>
                      </div>

                      {/* Status indicator pill */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    {/* Room Specs & Amenities */}
                    <div className="flex items-center gap-3 text-xs text-slate-600 my-3 py-2 border-y border-slate-100">
                      <div className="flex items-center gap-1" title="Room Capacity">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{room.capacity} seats</span>
                      </div>
                      {room.hasAC && (
                        <div className="flex items-center gap-1 text-sky-600 font-medium" title="Air Conditioned">
                          <Wind className="w-3.5 h-3.5" />
                          <span>AC</span>
                        </div>
                      )}
                      {room.hasProjector && (
                        <div className="flex items-center gap-1 text-indigo-600" title="HD Projector">
                          <Tv className="w-3.5 h-3.5" />
                          <span>Screen</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-slate-500 ml-auto" title="Quiet Focus Rating">
                        <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{room.quietRating}</span>
                      </div>
                    </div>

                    {/* Bottom Status Info / Action Callout */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      {room.status === 'FREE' ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Free until {room.freeUntil} ({room.countdownText})</span>
                        </div>
                      ) : room.status === 'ENDING_SOON' ? (
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Free for only {room.countdownText}!</span>
                        </div>
                      ) : (
                        <div className="text-slate-500">
                          Occupied until {room.freeUntil}
                        </div>
                      )}

                      <span className="text-indigo-600 group-hover:translate-x-1 transition-transform font-medium flex items-center text-[11px]">
                        Inspect <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW MODE 2: ARCHITECTURAL BLUEPRINT */}
        {viewMode === 'blueprint' && (
          <div className="w-full max-w-4xl bg-slate-900 text-white rounded-xl p-6 border-2 border-indigo-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs font-mono">
              <span className="text-indigo-400 tracking-wider">FLOOR SCHEMATIC // CAD-IST-LEVEL-{selectedFloor || 'ALL'}</span>
              <span className="text-slate-400">UNITS: METRIC • SCALE: 1:50</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleRooms.map(room => (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    room.status === 'FREE'
                      ? 'border-emerald-500/50 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-200'
                      : room.status === 'ENDING_SOON'
                      ? 'border-amber-500/50 bg-amber-950/20 hover:bg-amber-950/40 text-amber-200'
                      : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono font-bold text-white text-base">{room.name}</span>
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-black/40 border border-white/10">
                      {room.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono opacity-80 mb-2">
                    {room.floorLabel} • {room.capacity} SEATS • {room.hasAC ? 'AC-ENABLED' : 'NON-AC'}
                  </div>
                  <div className="text-xs font-mono text-indigo-300">
                    STATUS: {room.status === 'FREE' ? `CLEAR UNTIL ${room.freeUntil}` : `IN USE UNTIL ${room.freeUntil}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW MODE 3: TOWER STACK 7F */}
        {viewMode === 'stacked' && (
          <div className="w-full max-w-3xl flex flex-col gap-3 py-4">
            {[7, 6, 5, 4, 3, 2, 1].map(f => {
              const floorRooms = rooms.filter(r => r.floor === f);
              const freeCount = floorRooms.filter(r => r.status === 'FREE').length;
              const endingCount = floorRooms.filter(r => r.status === 'ENDING_SOON').length;
              const occupiedCount = floorRooms.filter(r => r.status === 'OCCUPIED').length;

              return (
                <div
                  key={f}
                  onClick={() => onSelectFloor(f)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-wrap items-center justify-between gap-4 ${
                    selectedFloor === f
                      ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {f === 1 ? 'GF' : `${f}F`}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {floorLabels[f]}
                      </div>
                      <div className="text-xs text-slate-500">
                        {floorRooms.length} Total Rooms ({floorRooms.map(r => r.name).join(', ')})
                      </div>
                    </div>
                  </div>

                  {/* Floor availability counts */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      🟢 {freeCount} Free
                    </span>
                    {endingCount > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        🟡 {endingCount} Ending Soon
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      🔴 {occupiedCount} Occupied
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFloor(f);
                        setViewMode('isometric');
                      }}
                      className="ml-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      View Floor →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Real-time room occupancy mapped to all 10 SRM IST Section Timetables
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Showing {visibleRooms.length} of {rooms.length} campus rooms
        </span>
      </div>
    </div>
  );
}
