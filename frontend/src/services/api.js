import axios from 'axios';
import {
  fallbackGetSections,
  fallbackGetSectionSubjects,
  fallbackGetSectionTimetable,
  fallbackCalculateAttendance,
  fallbackSimulateWhatIf,
  fallbackGetUpcomingClasses,
  fallbackGetCalendar,
  fallbackSimulateOD,
  fallbackAskAdvisor,
  fallbackGetSectionDashboard,
  fallbackGetSectionSchedule,
  fallbackCalculateLeaveImpact,
  fallbackGetRooms,
  fallbackGetFloors,
  fallbackGetRoomSchedule,
  fallbackSearchRoomsWithAI
} from './clientFallback';

const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

export const getSections = async () => {
  try {
    const res = await apiClient.get('/sections');
    if (res.data && res.data.length > 0) return res.data;
    return fallbackGetSections();
  } catch (err) {
    console.warn("Backend /sections unavailable, using client fallback engine:", err.message);
    return fallbackGetSections();
  }
};

export const getSectionSubjects = async (sectionId) => {
  try {
    const res = await apiClient.get(`/sections/${sectionId}/subjects`);
    if (res.data && res.data.length > 0) return res.data;
    return fallbackGetSectionSubjects(sectionId);
  } catch (err) {
    console.warn(`Backend /sections/${sectionId}/subjects unavailable, using client fallback:`, err.message);
    return fallbackGetSectionSubjects(sectionId);
  }
};

export const getSectionTimetable = async (sectionId) => {
  try {
    const res = await apiClient.get(`/sections/${sectionId}/timetable`);
    if (res.data) return res.data;
    return fallbackGetSectionTimetable(sectionId);
  } catch (err) {
    console.warn(`Backend /sections/${sectionId}/timetable unavailable, using client fallback:`, err.message);
    return fallbackGetSectionTimetable(sectionId);
  }
};

export const calculateAttendance = async (payload) => {
  try {
    const res = await apiClient.post('/attendance/calculate', payload);
    if (res.data) return res.data;
    return fallbackCalculateAttendance(payload);
  } catch (err) {
    console.warn("Backend /attendance/calculate unavailable, using client math engine:", err.message);
    return fallbackCalculateAttendance(payload);
  }
};

export const planAttendance = async (payload) => {
  try {
    const res = await apiClient.post('/attendance/plan', payload);
    if (res.data) return res.data;
    return fallbackCalculateAttendance(payload);
  } catch (err) {
    console.warn("Backend /attendance/plan unavailable, using client fallback:", err.message);
    return fallbackCalculateAttendance(payload);
  }
};

export const simulateWhatIf = async (payload) => {
  try {
    const res = await apiClient.post('/attendance/simulate', payload);
    if (res.data) return res.data;
    return fallbackSimulateWhatIf(payload);
  } catch (err) {
    console.warn("Backend /attendance/simulate unavailable, using client fallback:", err.message);
    return fallbackSimulateWhatIf(payload);
  }
};

export const getUpcomingClasses = async (params) => {
  try {
    const res = await apiClient.get('/attendance/upcoming', { params });
    if (res.data && res.data.length > 0) return res.data;
    return fallbackGetUpcomingClasses(params);
  } catch (err) {
    console.warn("Backend /attendance/upcoming unavailable, using client fallback:", err.message);
    return fallbackGetUpcomingClasses(params);
  }
};

export const getCalendar = async (params) => {
  try {
    const res = await apiClient.get('/attendance/calendar', { params });
    if (res.data && res.data.length > 0) return res.data;
    return fallbackGetCalendar(params);
  } catch (err) {
    console.warn("Backend /attendance/calendar unavailable, using client fallback:", err.message);
    return fallbackGetCalendar(params);
  }
};

// --- PHASE 2 ENDPOINTS ---

export const simulateOD = async (payload) => {
  try {
    const res = await apiClient.post('/od/simulate', payload);
    if (res.data) return res.data;
    return fallbackSimulateOD(payload);
  } catch (err) {
    console.warn("Backend /od/simulate unavailable, using client fallback:", err.message);
    return fallbackSimulateOD(payload);
  }
};

export const askAdvisor = async (payload) => {
  try {
    const res = await apiClient.post('/chat/advisor', payload);
    if (res.data) return res.data;
    return fallbackAskAdvisor(payload);
  } catch (err) {
    console.warn("Backend /chat/advisor unavailable, using client advisor fallback:", err.message);
    return fallbackAskAdvisor(payload);
  }
};

export const getSectionDashboard = async (sectionId, todayDate = null) => {
  try {
    const params = todayDate ? { todayDate } : {};
    const res = await apiClient.get(`/dashboard/${sectionId}`, { params });
    if (res.data) return res.data;
    return fallbackGetSectionDashboard(sectionId);
  } catch (err) {
    console.warn(`Backend /dashboard/${sectionId} unavailable, using client dashboard fallback:`, err.message);
    return fallbackGetSectionDashboard(sectionId);
  }
};

export const getSectionSchedule = async (sectionId, date = null) => {
  try {
    const params = date ? { date } : {};
    const res = await apiClient.get(`/sections/${sectionId}/schedule`, { params });
    if (res.data) return res.data;
    return fallbackGetSectionSchedule(sectionId, date);
  } catch (err) {
    console.warn(`Backend /sections/${sectionId}/schedule unavailable, using client schedule fallback:`, err.message);
    return fallbackGetSectionSchedule(sectionId, date);
  }
};

export const calculateLeaveImpact = async (payload) => {
  try {
    const res = await apiClient.post('/attendance/leave-impact', payload);
    if (res.data) return res.data;
    return fallbackCalculateLeaveImpact(payload);
  } catch (err) {
    console.warn("Backend /attendance/leave-impact unavailable, using client fallback:", err.message);
    return fallbackCalculateLeaveImpact(payload);
  }
};

// --- ROUND 2: FREE CLASS LOCATOR ENDPOINTS ---

export const getRooms = async (day = "Monday", time = "13:30", floor = null) => {
  try {
    const params = { day, time };
    if (floor !== null && floor !== undefined && floor !== "") {
      params.floor = floor;
    }
    const res = await apiClient.get('/rooms', { params });
    if (res.data && res.data.length > 0) return res.data;
    return fallbackGetRooms(day, time, floor);
  } catch (err) {
    console.warn("Backend /rooms unavailable, using client room engine:", err.message);
    return fallbackGetRooms(day, time, floor);
  }
};

export const getFloors = async () => {
  try {
    const res = await apiClient.get('/rooms/floors');
    if (res.data && res.data.length > 0) return res.data;
    return fallbackGetFloors();
  } catch (err) {
    console.warn("Backend /rooms/floors unavailable, using client floors fallback:", err.message);
    return fallbackGetFloors();
  }
};

export const getRoomSchedule = async (roomId) => {
  try {
    const res = await apiClient.get(`/rooms/${roomId}/schedule`);
    if (res.data) return res.data;
    return fallbackGetRoomSchedule(roomId);
  } catch (err) {
    console.warn(`Backend /rooms/${roomId}/schedule unavailable, using client fallback:`, err.message);
    return fallbackGetRoomSchedule(roomId);
  }
};

export const searchRoomsWithAI = async (query, day = "Monday", time = "13:30") => {
  try {
    const res = await apiClient.post('/rooms/ai-search', { query, day, time });
    if (res.data) return res.data;
    return fallbackSearchRoomsWithAI(query, day, time);
  } catch (err) {
    console.warn("Backend /rooms/ai-search unavailable, using client AI search fallback:", err.message);
    return fallbackSearchRoomsWithAI(query, day, time);
  }
};

export default apiClient;
