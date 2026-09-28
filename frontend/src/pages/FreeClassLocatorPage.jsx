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
  ChevronRight,
  ArrowRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { getRooms, getFloors, searchRoomsWithAI } from '../services/api';
import Campus3DMap from '../components/Campus3DMap';
import RoomCountdownModal from '../components/RoomCountdownModal';

export default function FreeClassLocatorPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState('Monday');
  const [currentTime, setCurrentTime] = useState('13:30');
  const [selectedFloor, setSelectedFloor] = useState(1); // Default to Ground Floor (Floor 1)
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
  const [statusFilter, setStatusFilter] = useState('ALL');

  const samplePrompts = [
    "I need an AC room on the ground floor for me and my team for the next 2 hours.",
    "Quiet room on 5th floor with projector for 1 hour",
    "Classroom for 40 people with AC on 2nd floor",
    "Where can 4 students study silently right now?"
  ];

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
      // If AI detected a target floor, jump to it automatically
      if (res?.parsedParams?.targetFloor) {
        setSelectedFloor(res.parsedParams.targetFloor);
      }
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

  // Summary counts
  const totalRooms = rooms.length;
  const freeRooms = rooms.filter(r => r.status === 'FREE').length;
  const endingSoonRooms = rooms.filter(r => r.status === 'ENDING_SOON').length;
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;

  const filteredRooms = rooms.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (filterAC && !r.hasAC) return false;
    if (filterProjector && !r.hasProjector) return false;
    return true;
  });

  return (
    <div className="w-full text-slate-900 px-4 sm:px-6 lg:px-8 py-6">
      
      {/* LEFT-ALIGNED 2-COLUMN DESKTOP ARRANGEMENT */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        
        {/* LEFT COLUMN: COMMAND BAR & FILTERS (LEFT-ANCHORED) */}
        <aside className="w-full lg:w-[380px] shrink-0 space-y-5">
          
          {/* Page Header */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Round 2 • Free Class Locator</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Classroom Locator
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Find open study spaces in the IST Building mapped dynamically against all 10 SRM timetables.
            </p>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
              <div className="bg-emerald-50/70 border border-emerald-200/80 p-2 rounded-xl">
                <div className="text-lg font-bold text-emerald-700">{freeRooms}</div>
                <div className="text-[10px] font-semibold text-emerald-800 uppercase">🟢 Free Now</div>
              </div>
              <div className="bg-amber-50/70 border border-amber-200/80 p-2 rounded-xl">
                <div className="text-lg font-bold text-amber-700">{endingSoonRooms}</div>
                <div className="text-[10px] font-semibold text-amber-800 uppercase">🟡 Soon</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl">
                <div className="text-lg font-bold text-slate-700">{occupiedRooms}</div>
                <div className="text-[10px] font-semibold text-slate-600 uppercase">🔴 Busy</div>
              </div>
            </div>
          </div>

          {/* Time & Day Controls */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Schedule Context
              </span>
              <button
                onClick={fetchRooms}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
                title="Refresh rooms"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Day Selector */}
            <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-xl text-center">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={`py-1 rounded-lg text-xs font-semibold transition-all ${
                    day === d
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Time Selector Dropdown */}
            <select
              value={currentTime}
              onChange={(e) => setCurrentTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
          </div>

          {/* AI Room Finder Panel */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs">AI Smart Room Finder</h3>
              </div>
              {aiResults && (
                <button
                  onClick={() => { setAiQuery(''); setAiResults(null); }}
                  className="text-[11px] text-slate-400 hover:text-slate-700"
                >
                  Reset
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); handleAiSearch(); }}
              className="space-y-2"
            >
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g. AC room on ground floor for 2 hours..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={aiSearching || !aiQuery.trim()}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {aiSearching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Search With AI</span>
                  </>
                )}
              </button>
            </form>

            {/* Prompt Chips */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Prompts:
              </span>
              {samplePrompts.slice(0, 2).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(p)}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 text-[11px] text-slate-700 transition-colors line-clamp-1"
                >
                  "{p}"
                </button>
              ))}
            </div>

            {/* AI Results Drawer */}
            {aiResults && (
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-2 mt-2">
                <div className="flex items-center justify-between font-semibold text-indigo-900 text-[11px]">
                  <span>Matches: {aiResults.matchCount} Rooms</span>
                  <span>{aiResults.parsedParams.durationHours}h Req</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {aiResults.topMatches.map(r => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRoom(r)}
                      className="p-2 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 cursor-pointer transition-all flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{r.name}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5">({r.floorLabel})</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {r.matchScore}% Match
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Floor & Filter Preferences */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Floor & Amenities
            </span>

            {/* Floor Selection Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFloor(f)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedFloor === f
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {f === 1 ? 'GF' : `${f}F`}
                </button>
              ))}
              <button
                onClick={() => setSelectedFloor(null)}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFloor === null
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                All
              </button>
            </div>

            {/* Amenity Checkboxes */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterAC}
                  onChange={(e) => setFilterAC(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>AC Only</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterProjector}
                  onChange={(e) => setFilterProjector(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Projector</span>
              </label>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: MAIN CANVAS (3D SPATIAL MODEL & TIMETABLE GRID) */}
        <main className="flex-1 w-full space-y-5">
          
          {/* View Switcher Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">View Mode:</span>
              <button
                onClick={() => setActiveTab('3d')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === '3d'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>3D Spatial Building Map</span>
              </button>

              <button
                onClick={() => setActiveTab('grid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'grid'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Floor Timetable Grid</span>
              </button>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              IST Building • Day: {day}
            </span>
          </div>

          {/* VIEW: 3D MODEL */}
          {activeTab === '3d' ? (
            <Campus3DMap
              rooms={rooms}
              selectedFloor={selectedFloor}
              onSelectFloor={setSelectedFloor}
              onSelectRoom={setSelectedRoom}
            />
          ) : (
            /* VIEW: FLOOR TIMETABLE GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRooms.map(room => {
                const isFree = room.status === 'FREE';
                const isEndingSoon = room.status === 'ENDING_SOON';

                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{room.name}</h4>
                          <span className="text-[11px] text-slate-500">{room.floorLabel} • {room.capacity} seats</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          isFree
                            ? 'bg-emerald-100 text-emerald-800'
                            : isEndingSoon
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isFree ? '🟢 Free' : isEndingSoon ? '🟡 Soon' : '🔴 Busy'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 my-2">
                        {isFree ? (
                          <div className="font-semibold text-emerald-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Free until {room.freeUntil}</span>
                          </div>
                        ) : isEndingSoon ? (
                          <div className="font-bold text-amber-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Ending in {room.countdownText}!</span>
                          </div>
                        ) : (
                          <div className="text-slate-500">
                            Booked until {room.freeUntil}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                      <span>Inspect Room</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* POPUP ROOM COUNTDOWN & WHATSAPP SQUAD MODAL */}
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
