// Centralized persistence & calculation layer for Attendance Predictor
// Handles Daily Attendance Records, Attendance History, Leave Plans, and Risk Alerts

const STORAGE_KEYS = {
  RECORDS: 'attendance_daily_records_v1',
  LEAVE_PLANS: 'attendance_leave_plans_v1',
  THRESHOLD: 'attendance_threshold_v1'
};

// --- DEFAULT SETTINGS ---
export const getAttendanceThreshold = () => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.THRESHOLD);
    return val ? parseFloat(val) : 75.0;
  } catch (e) {
    return 75.0;
  }
};

export const setAttendanceThreshold = (threshold) => {
  try {
    localStorage.setItem(STORAGE_KEYS.THRESHOLD, String(threshold));
  } catch (e) {
    console.error("Failed to save threshold", e);
  }
};

// --- DAILY ATTENDANCE MARKING ---

export const getDailyRecords = (sectionId = null, date = null) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    let records = raw ? JSON.parse(raw) : [];
    if (sectionId) {
      records = records.filter(r => r.sectionId === sectionId);
    }
    if (date) {
      records = records.filter(r => r.date === date);
    }
    return records;
  } catch (e) {
    console.error("Error reading attendance records", e);
    return [];
  }
};

/**
 * Marks or updates a daily attendance record.
 * Handles duplicate prevention: updates status if record already exists for (sectionId, date, period, subjectCode).
 */
export const markAttendanceRecord = ({
  sectionId,
  date,
  subjectCode,
  subjectName,
  period,
  time,
  faculty,
  venue,
  status // "PRESENT" | "ABSENT" | "CANCELLED"
}) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    let records = raw ? JSON.parse(raw) : [];

    const recordId = `${sectionId}_${date}_P${period}_${subjectCode}`;
    const existingIndex = records.findIndex(r => r.id === recordId || (
      r.sectionId === sectionId &&
      r.date === date &&
      r.period === period &&
      r.subjectCode === subjectCode
    ));

    const recordData = {
      id: recordId,
      date,
      sectionId,
      subjectCode,
      subjectName,
      period,
      time: time || `Period ${period}`,
      faculty: faculty || '',
      venue: venue || '',
      status: status.toUpperCase(), // "PRESENT", "ABSENT", "CANCELLED"
      updatedAt: new Date().toISOString()
    };

    let wasUpdated = false;
    let previousStatus = null;

    if (existingIndex >= 0) {
      previousStatus = records[existingIndex].status;
      records[existingIndex] = {
        ...records[existingIndex],
        ...recordData
      };
      wasUpdated = true;
    } else {
      recordData.createdAt = new Date().toISOString();
      records.unshift(recordData);
    }

    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    return { success: true, record: recordData, wasUpdated, previousStatus };
  } catch (e) {
    console.error("Error saving attendance record", e);
    return { success: false, error: e.message };
  }
};

/**
 * Removes an attendance record by ID.
 */
export const deleteAttendanceRecord = (recordId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    let records = raw ? JSON.parse(raw) : [];
    records = records.filter(r => r.id !== recordId);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    return true;
  } catch (e) {
    return false;
  }
};

// --- ATTENDANCE HISTORY FILTERING & SEARCH ---

export const getAttendanceHistory = ({
  sectionId = '',
  subjectCode = 'ALL',
  status = 'ALL',
  month = 'ALL',
  searchQuery = ''
}) => {
  let records = getDailyRecords(sectionId);

  // Filter by subject
  if (subjectCode && subjectCode !== 'ALL') {
    records = records.filter(r => r.subjectCode === subjectCode);
  }

  // Filter by status
  if (status && status !== 'ALL') {
    records = records.filter(r => r.status.toUpperCase() === status.toUpperCase());
  }

  // Filter by month (e.g., "2026-09" or "2026-10")
  if (month && month !== 'ALL') {
    records = records.filter(r => r.date.startsWith(month));
  }

  // Search query (subject name, code, date, status)
  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    records = records.filter(r => 
      r.subjectName.toLowerCase().includes(q) ||
      r.subjectCode.toLowerCase().includes(q) ||
      r.date.includes(q) ||
      r.status.toLowerCase().includes(q) ||
      (r.faculty && r.faculty.toLowerCase().includes(q))
    );
  }

  // Sort descending by date and period
  records.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.period - a.period;
  });

  return records;
};

/**
 * Aggregates recorded attendance counts per subject from real records.
 */
export const getSubjectRecordedSummary = (sectionId) => {
  const records = getDailyRecords(sectionId);
  const summary = {};

  records.forEach(r => {
    if (!summary[r.subjectCode]) {
      summary[r.subjectCode] = {
        subjectCode: r.subjectCode,
        subjectName: r.subjectName,
        totalRecorded: 0,
        present: 0,
        absent: 0,
        cancelled: 0,
        conducted: 0
      };
    }
    const item = summary[r.subjectCode];
    item.totalRecorded += 1;
    if (r.status === 'PRESENT') {
      item.present += 1;
      item.conducted += 1;
    } else if (r.status === 'ABSENT') {
      item.absent += 1;
      item.conducted += 1;
    } else if (r.status === 'CANCELLED') {
      item.cancelled += 1;
    }
  });

  // Calculate percentage
  Object.values(summary).forEach(item => {
    item.percentage = item.conducted > 0 
      ? Math.round((item.present / item.conducted) * 1000) / 10 
      : 100.0;
  });

  return summary;
};

// --- LEAVE PLAN MANAGEMENT ---

export const getLeavePlans = (sectionId = null) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEAVE_PLANS);
    let plans = raw ? JSON.parse(raw) : [];
    if (sectionId) {
      plans = plans.filter(p => p.sectionId === sectionId);
    }
    plans.sort((a, b) => a.startDate.localeCompare(b.startDate));
    return plans;
  } catch (e) {
    return [];
  }
};

export const saveLeavePlan = ({
  id = null,
  sectionId,
  title,
  startDate,
  endDate,
  reason,
  affectedClassesCount = 0,
  projectedOverallAttendance = 0,
  affectedSubjects = []
}) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEAVE_PLANS);
    let plans = raw ? JSON.parse(raw) : [];

    const planId = id || `plan_${Date.now()}`;
    const newPlan = {
      id: planId,
      sectionId,
      title: title || reason || "Planned Leave",
      startDate,
      endDate,
      reason: reason || "Personal",
      affectedClassesCount,
      projectedOverallAttendance,
      affectedSubjects,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = plans.findIndex(p => p.id === planId);
    if (existingIndex >= 0) {
      plans[existingIndex] = { ...plans[existingIndex], ...newPlan };
    } else {
      newPlan.createdAt = new Date().toISOString();
      plans.push(newPlan);
    }

    localStorage.setItem(STORAGE_KEYS.LEAVE_PLANS, JSON.stringify(plans));
    return { success: true, plan: newPlan };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const deleteLeavePlan = (planId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEAVE_PLANS);
    let plans = raw ? JSON.parse(raw) : [];
    plans = plans.filter(p => p.id !== planId);
    localStorage.setItem(STORAGE_KEYS.LEAVE_PLANS, JSON.stringify(plans));
    return true;
  } catch (e) {
    return false;
  }
};

// --- DETERMINISTIC SHARED ATTENDANCE MATH & RISK ALERTS ---

/**
 * Evaluates subject risk status against threshold (default 75%).
 * SAFE: >= 80%
 * WARNING: 75% <= score < 80% (close to minimum attendance)
 * CRITICAL: < 75% or irreversible detention
 */
export const calculateRiskStatus = (currentPct, threshold = 75.0, isDetention = false) => {
  if (isDetention || currentPct < threshold) {
    return {
      status: 'CRITICAL',
      label: 'Critical Shortage',
      color: 'red',
      bgClass: 'bg-rose-950/40 text-rose-300 border-rose-800',
      badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      message: 'Attendance is strictly below the required threshold.'
    };
  }
  if (currentPct < threshold + 5.0) {
    return {
      status: 'WARNING',
      label: 'Warning (Borderline)',
      color: 'amber',
      bgClass: 'bg-amber-950/40 text-amber-300 border-amber-800',
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      message: 'Attendance is close to the minimum required percentage.'
    };
  }
  return {
    status: 'SAFE',
    label: 'Safe Standing',
    color: 'emerald',
    bgClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-800',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    message: 'Attendance is comfortably above the threshold.'
  };
};
