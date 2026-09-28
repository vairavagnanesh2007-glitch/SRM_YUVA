import axios from 'axios';

const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const getSections = async () => {
  const res = await apiClient.get('/sections');
  return res.data;
};

export const getSectionSubjects = async (sectionId) => {
  const res = await apiClient.get(`/sections/${sectionId}/subjects`);
  return res.data;
};

export const getSectionTimetable = async (sectionId) => {
  const res = await apiClient.get(`/sections/${sectionId}/timetable`);
  return res.data;
};

export const calculateAttendance = async (payload) => {
  const res = await apiClient.post('/attendance/calculate', payload);
  return res.data;
};

export const planAttendance = async (payload) => {
  const res = await apiClient.post('/attendance/plan', payload);
  return res.data;
};

export const simulateWhatIf = async (payload) => {
  const res = await apiClient.post('/attendance/simulate', payload);
  return res.data;
};

export const getUpcomingClasses = async (params) => {
  const res = await apiClient.get('/attendance/upcoming', { params });
  return res.data;
};

export const getCalendar = async (params) => {
  const res = await apiClient.get('/attendance/calendar', { params });
  return res.data;
};

// --- PHASE 2 ENDPOINTS ---

export const simulateOD = async (payload) => {
  const res = await apiClient.post('/od/simulate', payload);
  return res.data;
};

export const askAdvisor = async (payload) => {
  const res = await apiClient.post('/chat/advisor', payload);
  return res.data;
};

export const getSectionDashboard = async (sectionId, todayDate = null) => {
  const params = todayDate ? { todayDate } : {};
  const res = await apiClient.get(`/dashboard/${sectionId}`, { params });
  return res.data;
};

export const getSectionSchedule = async (sectionId, date = null) => {
  const params = date ? { date } : {};
  const res = await apiClient.get(`/sections/${sectionId}/schedule`, { params });
  return res.data;
};

export const calculateLeaveImpact = async (payload) => {
  const res = await apiClient.post('/attendance/leave-impact', payload);
  return res.data;
};

export default apiClient;
