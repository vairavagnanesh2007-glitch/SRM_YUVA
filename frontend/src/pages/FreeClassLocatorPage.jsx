import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Sparkles, 
  Filter, 
  Clock, 
  Users, 
  Wind, 
  Tv, 
  Volume2, 
  MapPin, 
  Share2, 
  Compass, 
  Layers, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { getRooms, getFloors, searchRoomsWithAI } from '../services/api';
import Campus3DMap from '../components/Campus3DMap';
import RoomCountdownModal from '../components/RoomCountdownModal';

export default function FreeClassLocatorPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState('Monday');
  const [currentTime, setCurrentTime] = useState('13:30');
  const [selectedFloor, setSelectedFloor] = useState(null); // null means All Floors
  const [activeTab, setActiveTab] = useState('3d'); // '3d' | 'grid'
  
  // AI Room Search state
  const [aiQuery, setAiQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  
  // Modal selection
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Filters for Grid view
  const [filterAC, setFilterAC] = useState(false);
  const [filterProjector, setFilterProjector] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'FREE' | 'ENDING_SOON' | 'OCCUPIED'

  const samplePrompts = [
    "I need an AC room on the ground floor for me and my team for the next 2 hours.",
    "Quiet room on 5th floor with projector for 1 hour",
    "Spacious room with AC for 50 people on 2nd floor",
    "Where can 4 students study silently right now?"
  ];

  // Load rooms when day or currentTime or selectedFloor changes
  useEffect(() => {
    fetchRooms();
  }, [day, currentTime, selectedFloor]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await getRooms(day, currentTime, selectedFloor);
      setRooms(data || []);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiSearch = async (queryText = aiQuery) => {
    if (!queryText.trim()) return;
    setAiSearching(true);
    try {
      const res = await searchRoomsWithAI(queryText, day, currentTime);
      setAiResults(res);
    } catch (err) {
      console.error("AI Search failed:", err);
    } finally {
      setAiSearching(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setAiQuery(prompt);
    handleAiSearch(prompt);
  };

  const handleClearAiSearch = () => {
    setAiQuery('');
    setAiResults(null);
  };

  // Summary counts
  const totalRooms = rooms.length;
  const freeRooms = rooms.filter(r => r.status === 'FREE').length;
  const endingSoonRooms = rooms.filter(r => r.status === 'ENDING_SOON').length;
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;

  // Filtered rooms for grid view
  const filteredRooms = rooms.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (filterAC && !r.hasAC) return false;
    if (filterProjector && !r.hasProjector) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* TOP HERO & HEADER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-gradient-to-br from-indigo-100/40 via-sky-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Round 2 Official Feature: The Free Class Locator</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Live Classroom Locator & 3D Spatial Map
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-2 leading-relaxed">
              Find unoccupied classrooms across all 7 floors of the IST Building, mapped dynamically against all 10 SRM department timetables. Features AI smart search, live countdown timers, and 1-click WhatsApp squad summoning.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl text-center min-w-[100px]">
              <div className="text-2xl font-extrabold text-slate-900">{totalRooms}</div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Total Rooms</div>
            </div>
            <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl text-center min-w-[100px]">
              <div className="text-2xl font-extrabold text-emerald-700">{freeRooms}</div>
              <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mt-0.5">🟢 Free Now</div>
            </div>
            <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl text-center min-w-[100px]">
              <div className="text-2xl font-extrabold text-amber-700">{endingSoonRooms}</div>
              <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mt-0.5">🟡 Ending Soon</div>
            </div>
            <div className="bg-rose-50/60 border border-rose-200 p-3.5 rounded-2xl text-center min-w-[100px]">
              <div className="text-2xl font-extrabold text-rose-700">{occupiedRooms}</div>
              <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider mt-0.5">🔴 Occupied</div>
            </div>
          </div>
        </div>

        {/* TIME & DAY SIMULATION CONTROLS */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Simulate Time & Day:
            </span>

            {/* Day Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    day === d
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Time Selector */}
            <div className="flex items-center gap-2">
              <select
                value={currentTime}
                onChange={(e) => setCurrentTime(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="09:15">09:15 AM (Period 1)</option>
                <option value="10:15">10:15 AM (Period 2)</option>
                <option value="11:15">11:15 AM (Period 3)</option>
                <option value="12:00">12:00 PM (Period 4)</option>
                <option value="12:45">12:45 PM (Lunch Break)</option>
                <option value="13:30">01:30 PM (Period 6)</option>
                <option value="14:30">02:30 PM (Period 7)</option>
                <option value="15:30">03:30 PM (Period 8)</option>
                <option value="16:15">04:15 PM (Period 9)</option>
              </select>

              <button
                onClick={fetchRooms}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                title="Refresh Room Status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* VIEW SWITCHER: 3D MAP vs FLOOR GRID */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('3d')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === '3d'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>3D Spatial Map</span>
            </button>
            <button
              onClick={() => setActiveTab('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'grid'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Floor Grid Manager</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI ROOM FINDER SEARCH BAR (PHASE 1 REQUIREMENT) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">The AI Room Finder</h3>
              <p className="text-xs text-slate-500">Describe what you need in plain English</p>
            </div>
          </div>
          {aiResults && (
            <button
              onClick={handleClearAiSearch}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset Search
            </button>
          )}
        </div>

        {/* Input & Search Button */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAiSearch(); }}
          className="flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder='e.g. "I need an AC room on the ground floor for me and my team for the next 2 hours."'
              className="w-full pl-11 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={aiSearching || !aiQuery.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shadow-xs flex items-center justify-center gap-2"
          >
            {aiSearching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Finding Rooms...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Find Room</span>
              </>
            )}
          </button>
        </form>

        {/* Clickable Prompt Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-400 mr-1">Try asking:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(p)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 text-[11px] font-medium text-slate-700 hover:text-indigo-800 transition-all text-left"
            >
              "{p}"
            </button>
          ))}
        </div>

        {/* AI SEARCH RESULTS DRAWER */}
        {aiResults && (
          <div className="mt-4 p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  AI Match Results ({aiResults.matchCount} Rooms Found)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                  Required: {aiResults.parsedParams.durationHours}h ({aiResults.parsedParams.requiredMinutes} mins)
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Filters detected: {aiResults.parsedParams.requiresAC ? '❄️ AC ' : ''}{aiResults.parsedParams.requiresProjector ? '📽️ Projector ' : ''}{aiResults.parsedParams.targetFloor ? `🏢 Floor ${aiResults.parsedParams.targetFloor}` : ''}
              </div>
            </div>

            {aiResults.topMatches.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No rooms match all criteria right now. Try lowering duration or removing floor constraints.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiResults.topMatches.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className="p-4 rounded-xl bg-white border border-indigo-200 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                            {room.name}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {room.floorLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{room.type}</p>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                        {room.matchScore}% Match
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 my-2 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100 font-sans">
                      {room.matchReason}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="font-semibold text-emerald-700">
                        Free until {room.freeUntil}
                      </span>
                      <span className="text-indigo-600 group-hover:translate-x-1 transition-transform font-medium flex items-center text-[11px]">
                        Call Squad <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MAIN VIEWPORT: 3D MAP OR FLOOR GRID */}
      {activeTab === '3d' ? (
        <Campus3DMap
          rooms={rooms}
          selectedFloor={selectedFloor}
          onSelectFloor={setSelectedFloor}
          onSelectRoom={setSelectedRoom}
        />
      ) : (
        /* FLOOR GRID VIEW */
        <div className="space-y-6">
          {/* Floor & Amenity Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Status Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-1">Status:</span>
              {[
                { id: 'ALL', label: 'All Rooms' },
                { id: 'FREE', label: '🟢 Free' },
                { id: 'ENDING_SOON', label: '🟡 Ending Soon' },
                { id: 'OCCUPIED', label: '🔴 Occupied' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    statusFilter === s.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Amenity Checkboxes & Floor Dropdown */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterAC}
                  onChange={(e) => setFilterAC(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>AC Only</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterProjector}
                  onChange={(e) => setFilterProjector(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Projector</span>
              </label>

              <select
                value={selectedFloor || ''}
                onChange={(e) => setSelectedFloor(e.target.value ? parseInt(e.target.value) : null)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="">All Floors</option>
                <option value="1">Ground Floor (1F)</option>
                <option value="2">2nd Floor (2F)</option>
                <option value="3">3rd Floor (3F)</option>
                <option value="4">4th Floor (4F)</option>
                <option value="5">5th Floor (5F)</option>
                <option value="6">6th Floor (6F)</option>
                <option value="7">7th Floor (7F)</option>
              </select>
            </div>
          </div>

          {/* Room Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRooms.map((room) => {
              const isFree = room.status === 'FREE';
              const isEndingSoon = room.status === 'ENDING_SOON';

              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`bg-white rounded-2xl border p-5 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between ${
                    isFree 
                      ? 'border-emerald-200 hover:border-emerald-400' 
                      : isEndingSoon 
                      ? 'border-amber-200 hover:border-amber-400' 
                      : 'border-slate-200 hover:border-slate-300 opacity-90 hover:opacity-100'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600">
                            {room.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {room.floorLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{room.type}</p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        isFree 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : isEndingSoon 
                          ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {isFree ? '🟢 Free' : isEndingSoon ? '🟡 Ending Soon' : '🔴 Occupied'}
                      </span>
                    </div>

                    {/* Room Amenities */}
                    <div className="flex items-center gap-3 text-xs text-slate-600 my-3 py-2 border-y border-slate-100">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{room.capacity} seats</span>
                      </div>
                      {room.hasAC && (
                        <div className="flex items-center gap-1 text-sky-600 font-medium">
                          <Wind className="w-3.5 h-3.5" />
                          <span>AC</span>
                        </div>
                      )}
                      {room.hasProjector && (
                        <div className="flex items-center gap-1 text-indigo-600">
                          <Tv className="w-3.5 h-3.5" />
                          <span>Projector</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-slate-500 ml-auto">
                        <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{room.quietRating} Quiet</span>
                      </div>
                    </div>

                    {/* Status Info */}
                    <div className="text-xs space-y-1 my-2">
                      {isFree ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span>Free for {room.countdownText} (until {room.freeUntil})</span>
                        </div>
                      ) : isEndingSoon ? (
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                          <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                          <span>Only {room.countdownText} left until class starts!</span>
                        </div>
                      ) : (
                        <div className="text-slate-500">
                          In use until <span className="font-semibold text-slate-700">{room.freeUntil}</span>
                          {room.currentBooking && (
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {room.currentBooking.section} ({room.currentBooking.subjectCode})
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
                      <Clock className="w-3.5 h-3.5" />
                      Live Countdown & Squad
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoom(room);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* POPUP ROOM COUNTDOWN & CALL THE SQUAD MODAL */}
      {selectedRoom && (
        <RoomCountdownModal
          room={selectedRoom}
          day={day}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
}
