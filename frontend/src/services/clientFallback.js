import timetablesData from '../data/timetables.json';

const SEM_START = '2026-08-29';
const SEM_END = '2026-11-29';
const TODAY_REF = '2026-09-28';
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const fallbackGetSections = () => {
  return (timetablesData.sections || []).map(sec => ({
    id: sec.id,
    name: sec.name,
    batch: sec.batch,
    venue: sec.venue,
    timingType: sec.timingType || 'FN',
    subjectCount: (sec.subjects || []).length
  }));
};

export const fallbackGetSection = (sectionId) => {
  return (timetablesData.sections || []).find(
    s => s.id.toLowerCase() === (sectionId || '').toLowerCase() || s.name.toLowerCase() === (sectionId || '').toLowerCase()
  ) || null;
};

export const fallbackGetSectionSubjects = (sectionId) => {
  const sec = fallbackGetSection(sectionId);
  if (!sec) return [];
  return (sec.subjects || []).map(sub => ({
    code: sub.code,
    name: sub.name,
    slot: sub.slot,
    credit: sub.credit,
    faculty: sub.faculty,
    designation: sub.designation,
    weeklyPeriods: (sub.schedule || []).reduce((acc, s) => acc + (s.periods || []).length, 0)
  }));
};

export const fallbackGetSectionTimetable = (sectionId) => {
  const sec = fallbackGetSection(sectionId);
  if (!sec) return null;
  return {
    sectionId: sec.id,
    name: sec.name,
    venue: sec.venue,
    timingType: sec.timingType,
    periods: sec.periods || [
      { period: 1, time: '09:00 - 09:50' },
      { period: 2, time: '09:50 - 10:40' },
      { period: 3, time: '10:50 - 11:40' },
      { period: 4, time: '11:40 - 12:30' },
      { period: 5, time: '12:30 - 01:20', isLunch: true },
      { period: 6, time: '01:20 - 02:10' },
      { period: 7, time: '02:10 - 03:00' },
      { period: 8, time: '03:10 - 04:00' },
      { period: 9, time: '04:00 - 04:50' }
    ],
    subjects: sec.subjects || []
  };
};

// Date occurrence helper
export const getScheduledClassesForSubject = (sectionId, subjectCode, startDateStr = SEM_START, endDateStr = SEM_END) => {
  const sec = fallbackGetSection(sectionId);
  if (!sec) return [];
  const subject = (sec.subjects || []).find(s => s.code.toLowerCase() === (subjectCode || '').toLowerCase());
  if (!subject) return [];

  // Map of dayName -> periods
  const scheduleMap = {};
  (subject.schedule || []).forEach(slot => {
    scheduleMap[slot.day] = slot.periods || [];
  });

  const occurrences = [];
  const cur = new Date(startDateStr);
  const end = new Date(endDateStr);

  while (cur <= end) {
    const dayName = DAYS_OF_WEEK[cur.getDay()];
    if (scheduleMap[dayName] && scheduleMap[dayName].length > 0) {
      const dateStr = cur.toISOString().split('T')[0];
      const periods = scheduleMap[dayName];
      periods.forEach(p => {
        occurrences.push({
          date: dateStr,
          formattedDate: cur.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          period: p,
          time: `Period ${p}`,
          venue: sec.venue || 'Classroom',
          faculty: subject.faculty || 'Faculty TBA',
          subjectCode: subject.code,
          subjectName: subject.name
        });
      });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return occurrences;
};

// Pure integer math calculation engine
export const fallbackCalculateAttendance = (payload) => {
  const {
    classesConducted = 0,
    classesAttended = 0,
    classesRemaining = 0,
    subjectCode = 'COURSE',
    subjectName = 'Course Subject'
  } = payload;

  const C = Math.max(0, parseInt(classesConducted) || 0);
  const A = Math.max(0, Math.min(C, parseInt(classesAttended) || 0));
  const R = Math.max(0, parseInt(classesRemaining) || 0);
  const total = C + R;

  const currentPct = C > 0 ? Math.round((A / C) * 1000) / 10 : 0.0;
  const maxPossible = total > 0 ? Math.round(((A + R) / total) * 1000) / 10 : currentPct;
  const minPossible = total > 0 ? Math.round((A / total) * 1000) / 10 : currentPct;

  // 75% target
  const req75Exact = Math.max(0, 0.75 * total - A);
  const req75Ceil = Math.ceil(req75Exact - 1e-9);
  const possible75 = maxPossible >= 75.0 && req75Ceil <= R;
  const safeToMiss75 = possible75 ? Math.max(0, R - req75Ceil) : 0;

  // 90% target
  const req90Exact = Math.max(0, 0.90 * total - A);
  const req90Ceil = Math.ceil(req90Exact - 1e-9);
  const possible90 = maxPossible >= 90.0 && req90Ceil <= R;
  const safeToMiss90 = possible90 ? Math.max(0, R - req90Ceil) : 0;

  // Status determination
  let status = "SAFE";
  let statusLabel = "SAFE (>= 75%)";
  let statusDescription = `Your attendance of ${currentPct}% safely meets university requirements.`;

  if (maxPossible < 75.0) {
    status = "IRREVERSIBLE_DETENTION";
    statusLabel = "IRREVERSIBLE DETENTION";
    statusDescription = `Even if you attend all ${R} remaining classes, your maximum possible attendance is ${maxPossible}%, below 75%.`;
  } else if (currentPct < 75.0) {
    status = "DANGER";
    statusLabel = "CRITICAL (< 75%)";
    statusDescription = `You are currently in the detention zone. You must attend at least ${req75Ceil} of the remaining ${R} classes.`;
  } else if (safeToMiss75 === 0) {
    status = "WATCH";
    statusLabel = "BORDERLINE (0 Safe Skips)";
    statusDescription = `You cannot miss any more classes without dropping below the 75% cutoff.`;
  }

  return {
    subjectCode,
    subjectName,
    classesConducted: C,
    classesAttended: A,
    classesRemaining: R,
    totalClassesInSemester: total,
    currentAttendance: currentPct,
    maximumPossibleAttendance: maxPossible,
    minimumPossibleAttendance: minPossible,
    status,
    statusLabel,
    statusDescription,
    target75: {
      thresholdPercentage: 75.0,
      requiredToAttend: req75Ceil,
      safeToMiss: safeToMiss75,
      possible: possible75
    },
    target90: {
      thresholdPercentage: 90.0,
      requiredToAttend: req90Ceil,
      safeToMiss: safeToMiss90,
      possible: possible90
    },
    proof: {
      c_conducted: C,
      a_attended: A,
      r_remaining: R,
      total_classes: total,
      target_75_threshold_count: Math.round(0.75 * total * 10) / 10,
      target_75_required_raw: Math.round(req75Exact * 10) / 10,
      target_75_required_ceil: req75Ceil,
      target_75_safe_miss: safeToMiss75,
      target_90_threshold_count: Math.round(0.90 * total * 10) / 10,
      target_90_required_raw: Math.round(req90Exact * 10) / 10,
      target_90_required_ceil: req90Ceil,
      target_90_safe_miss: safeToMiss90
    }
  };
};

export const fallbackSimulateWhatIf = (payload) => {
  const { classesConducted, classesAttended, classesRemaining, attendNext = 0, missNext = 0 } = payload;
  const newC = classesConducted + attendNext + missNext;
  const newA = classesAttended + attendNext;
  const newR = Math.max(0, classesRemaining - attendNext - missNext);

  const baseline = fallbackCalculateAttendance({ classesConducted, classesAttended, classesRemaining });
  const projected = fallbackCalculateAttendance({ classesConducted: newC, classesAttended: newA, classesRemaining: newR });

  const change = Math.round((projected.currentAttendance - baseline.currentAttendance) * 10) / 10;
  const isDetentionTriggered = baseline.status !== 'IRREVERSIBLE_DETENTION' && projected.status === 'IRREVERSIBLE_DETENTION';

  return {
    baseline,
    projected,
    impact: {
      attendanceChange: change,
      safeMissChange: projected.target75.safeToMiss - baseline.target75.safeToMiss,
      isDetentionTriggered
    }
  };
};

export const fallbackGetUpcomingClasses = (params) => {
  const { sectionId, subjectCode, limit = 10 } = params;
  const all = getScheduledClassesForSubject(sectionId, subjectCode, TODAY_REF, SEM_END);
  return all.slice(0, parseInt(limit) || 10);
};

export const fallbackGetCalendar = (params) => {
  const { sectionId, subjectCode } = params;
  const sec = fallbackGetSection(sectionId);
  if (!sec) return [];

  const subject = (sec.subjects || []).find(s => s.code.toLowerCase() === (subjectCode || '').toLowerCase());
  const scheduleMap = {};
  if (subject) {
    (subject.schedule || []).forEach(slot => { scheduleMap[slot.day] = slot.periods || []; });
  }

  const days = [];
  const cur = new Date(SEM_START);
  const end = new Date(SEM_END);
  const today = new Date(TODAY_REF);

  while (cur <= end) {
    const dateStr = cur.toISOString().split('T')[0];
    const dayName = DAYS_OF_WEEK[cur.getDay()];
    const periods = scheduleMap[dayName] || [];
    const hasClass = periods.length > 0;

    let state = 'FUTURE';
    if (dateStr === TODAY_REF) state = 'TODAY';
    else if (cur < today) state = 'PAST';

    days.push({
      date: dateStr,
      dayNumber: cur.getDate(),
      dayName,
      monthName: cur.toLocaleDateString('en-US', { month: 'short' }),
      state,
      hasClass,
      classCount: periods.length,
      classes: periods.map(p => ({
        subjectCode: subject?.code,
        subjectName: subject?.name,
        period: p,
        time: `Period ${p}`,
        venue: sec.venue
      }))
    });
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

export const fallbackSimulateOD = (payload) => {
  const { sectionId, leaveType = 'ON_DUTY', startDate = '2026-10-05', endDate = '2026-10-07', reason = 'Official Leave', policy = 'CONVERT_TO_ATTENDED' } = payload;
  const sec = fallbackGetSection(sectionId);
  if (!sec) return { error: "Section not found" };

  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

  // Compute affected periods across subjects
  let totalApproved = 0;
  let rescuedCount = 0;

  const subjectImpacts = (sec.subjects || []).map(sub => {
    const occurrences = getScheduledClassesForSubject(sec.id, sub.code, startDate, endDate);
    const odPeriods = occurrences.length;
    totalApproved += odPeriods;

    // Standard baseline: ~24 conducted, 16 attended (66.7% danger) or similar
    const baselineC = 25;
    const baselineA = 17;
    const baselineR = 35;
    const baseline = fallbackCalculateAttendance({ classesConducted: baselineC, classesAttended: baselineA, classesRemaining: baselineR, subjectCode: sub.code, subjectName: sub.name });

    let postC = baselineC;
    let postA = baselineA;
    if (policy === 'CONVERT_TO_ATTENDED') {
      postA += odPeriods;
    } else {
      postC = Math.max(1, baselineC - odPeriods);
    }
    const postLeave = fallbackCalculateAttendance({ classesConducted: postC, classesAttended: postA, classesRemaining: baselineR, subjectCode: sub.code, subjectName: sub.name });

    const delta = Math.round((postLeave.currentAttendance - baseline.currentAttendance) * 10) / 10;
    const isRescued = baseline.currentAttendance < 75.0 && postLeave.currentAttendance >= 75.0;
    if (isRescued) rescuedCount++;

    return {
      subjectCode: sub.code,
      subjectName: sub.name,
      slot: sub.slot,
      faculty: sub.faculty,
      odPeriodsCount: odPeriods,
      baseline,
      postLeave,
      impact: {
        attendanceDelta: delta,
        detentionRescued: isRescued
      }
    };
  });

  const letter = `To
The Head of Department,
School of Electrical & Electronics Engineering (SEEE),
SRM Institute of Science and Technology, Kattankulathur.

Subject: Request for Official ${leaveType === 'ON_DUTY' ? 'On-Duty (OD)' : 'Medical Leave (ML)'} Approval

Respected Sir/Madam,

I am writing to formally request approval for ${leaveType === 'ON_DUTY' ? 'On-Duty (OD)' : 'Medical Leave'} from ${startDate} to ${endDate} (${daysDiff} instructional days).

Reason: ${reason}
Section: ${sec.name} (${sec.batch || 'Batch 2026'})
Total Academic Periods Impacted: ${totalApproved} Contact Periods

According to the official attendance regulations and simulation parameters, these approved hours will be credited towards course attendance requirements, safeguarding eligibility for semester examinations.

Thanking You,

Yours obediently,
Student Representative (${sec.name})
Date: ${new Date().toLocaleDateString('en-US')}`;

  return {
    sectionId: sec.id,
    leaveType,
    dateRange: {
      startDate,
      endDate,
      totalDays: daysDiff,
      academicDays: daysDiff
    },
    totalPeriodsApproved: totalApproved,
    summary: {
      coursesAnalyzed: (sec.subjects || []).length,
      detentionRescuedCount: rescuedCount,
      overallBoost: totalApproved > 0 ? "+4.2%" : "0.0%"
    },
    subjectImpacts,
    officialLetter: letter
  };
};

export const fallbackAskAdvisor = (payload) => {
  const { query = "", sectionId = "III-ECE-B", subjectCode = "21ECC301J" } = payload;
  const q = query.toLowerCase();

  let advice = "";
  if (q.includes("sick") || q.includes("medical") || q.includes("leave")) {
    advice = `### Medical Leave Attendance Analysis
Based on the schedule for **${sectionId}**:
- Missing **3 days** of classes accounts for approximately **12 to 15 contact periods**.
- If your current attendance is above **80%**, your attendance will drop by approximately **3.5%**, remaining comfortably above the **75% detention threshold**.
- **Action Required:** Ensure you submit a certified medical fitness certificate within 3 days of return to apply for Medical Leave exemption.`;
  } else if (q.includes("od") || q.includes("hackathon") || q.includes("on duty")) {
    advice = `### On-Duty (OD) Simulation Result
- Participating in the **Hackathon** will impact approximately **17 contact periods**.
- Under the university's Credit Policy, having your OD approved will convert missed classes into **Attended Credits**.
- This rescues at-risk subjects and boosts your final projected standing back above 75%.`;
  } else if (q.includes("skip") || q.includes("miss") || q.includes("safe")) {
    advice = `### Safe Miss Limit Calculation
- For course **${subjectCode}**, you currently have **8 safe classes left to miss** before hitting 75%.
- To achieve **90% distinction**, you can safely miss only **2 classes**.
- Always keep an emergency buffer of at least 2 skips for unexpected illnesses.`;
  } else {
    advice = `### Real-Time Attendance Intelligence
- Section **${sectionId}** has **62 days remaining** in the semester.
- All 10 section timetables are actively monitored against the **75% minimum threshold** and **90% target**.
- Use the **What-If Simulator** or **Leave Planner** on the dashboard to test your custom scenarios.`;
  }

  return {
    response: advice,
    timestamp: new Date().toISOString()
  };
};

export const fallbackGetSectionDashboard = (sectionId) => {
  const sec = fallbackGetSection(sectionId);
  if (!sec) return null;

  const subjects = (sec.subjects || []).map((sub, i) => {
    // Generate realistic test distribution around 72-88%
    const conducted = 28 + (i % 4) * 2;
    const attended = i === 1 ? Math.floor(conducted * 0.68) : Math.floor(conducted * (0.76 + (i % 3) * 0.06));
    const remaining = 32;

    const calc = fallbackCalculateAttendance({
      classesConducted: conducted,
      classesAttended: attended,
      classesRemaining: remaining,
      subjectCode: sub.code,
      subjectName: sub.name
    });

    return {
      subjectCode: sub.code,
      subjectName: sub.name,
      slot: sub.slot,
      faculty: sub.faculty,
      conducted,
      attended,
      remaining,
      calculation: calc
    };
  });

  return {
    sectionId: sec.id,
    sectionName: sec.name,
    venue: sec.venue,
    timingType: sec.timingType,
    subjects
  };
};

export const fallbackGetSectionSchedule = (sectionId, dateStr) => {
  const sec = fallbackGetSection(sectionId);
  if (!sec) return { classes: [] };

  const targetDate = dateStr ? new Date(dateStr) : new Date(TODAY_REF);
  const dayName = DAYS_OF_WEEK[targetDate.getDay()];

  const classes = [];
  (sec.subjects || []).forEach(sub => {
    (sub.schedule || []).forEach(slot => {
      if (slot.day === dayName) {
        (slot.periods || []).forEach(p => {
          classes.push({
            subjectCode: sub.code,
            subjectName: sub.name,
            period: p,
            time: `Period ${p}`,
            venue: sec.venue,
            faculty: sub.faculty
          });
        });
      }
    });
  });

  classes.sort((a, b) => a.period - b.period);
  return {
    date: targetDate.toISOString().split('T')[0],
    dayName,
    classes
  };
};

export const fallbackCalculateLeaveImpact = (payload) => {
  const { sectionId, startDate, endDate, threshold = 75.0 } = payload;
  const sec = fallbackGetSection(sectionId);
  if (!sec) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

  let totalMissed = 0;
  const affected = [];

  (sec.subjects || []).forEach(sub => {
    const occurrences = getScheduledClassesForSubject(sec.id, sub.code, startDate, endDate);
    if (occurrences.length > 0) {
      totalMissed += occurrences.length;
      const conducted = 25;
      const attended = 20;
      const remaining = 35;
      const curPct = Math.round((attended / conducted) * 1000) / 10;

      // If absent for these classes:
      const projConducted = conducted + occurrences.length;
      const projAttended = attended;
      const projPct = Math.round((projAttended / projConducted) * 1000) / 10;
      const diff = Math.round((projPct - curPct) * 10) / 10;

      const reqRecovery = Math.ceil(Math.max(0, (threshold / 100.0) * (projConducted + remaining) - projAttended));

      affected.push({
        subjectCode: sub.code,
        subjectName: sub.name,
        classesAffected: occurrences.length,
        currentAttendance: curPct,
        projectedAttendance: projPct,
        difference: diff,
        classesRequiredToRecover: reqRecovery,
        status: projPct < threshold ? 'CRITICAL' : projPct < threshold + 5 ? 'WARNING' : 'SAFE'
      });
    }
  });

  return {
    startDate,
    endDate,
    totalDays: daysDiff,
    academicDays: daysDiff,
    totalClassesPotentiallyMissed: totalMissed,
    atRiskSubjectCount: affected.filter(a => a.projectedAttendance < threshold).length,
    affectedSubjects: affected
  };
};

// --- ROUND 2: THE FREE CLASS LOCATOR CLIENT-SIDE ENGINE ---

export const CAMPUS_ROOMS = [
  { id: "IST-101", name: "IST 101", building: "IST Building", floor: 1, floorLabel: "Ground Floor", capacity: 45, hasAC: true, hasProjector: true, hasWhiteboard: true, quietRating: "High", type: "Discussion Classroom" },
  { id: "IST-102", name: "IST 102", building: "IST Building", floor: 1, floorLabel: "Ground Floor", capacity: 30, hasAC: true, hasProjector: false, hasWhiteboard: true, quietRating: "Medium", type: "Team Project Room" },
  { id: "IST-105", name: "IST 105", building: "IST Building", floor: 1, floorLabel: "Ground Floor", capacity: 60, hasAC: true, hasProjector: true, hasWhiteboard: true, quietRating: "High", type: "AC Seminar Hall" },
  { id: "IST-211", name: "IST 211", building: "IST Building", floor: 2, floorLabel: "2nd Floor", capacity: 65, hasAC: true, hasProjector: true, hasWhiteboard: true, quietRating: "Medium", type: "Lecture Hall", primarySection: "III-BME" },
  { id: "IST-225", name: "IST 225", building: "IST Building", floor: 2, floorLabel: "2nd Floor", capacity: 60, hasAC: false, hasProjector: true, hasWhiteboard: true, quietRating: "High", type: "Smart Classroom", primarySection: "IV-ECE-A" },
  { id: "IST-227", name: "IST 227", building: "IST Building", floor: 2, floorLabel: "2nd Floor", capacity: 60, hasAC: false, hasProjector: true, hasWhiteboard: true, quietRating: "High", type: "Smart Classroom", primarySection: "IV-ECE-B" },
  { id: "IST-301", name: "IST 301", building: "IST Building", floor: 3, floorLabel: "3rd Floor", capacity: 40, hasAC: true, hasProjector: true, hasWhiteboard: true, quietRating: "High", type: "Robotics & Embedded Lab" },
  { id: "IST-305", name: "IST 305", building: "IST Building", floor: 3, floorLabel: "3rd Floor", capacity: 35, hasAC: false, hasProjector: false, hasWhiteboard: true, quietRating: "High", type: "Tutorial Room" },
  { id: "IST-411", name: "IST 411", building: "IST Building", floor: 4, floorLabel: "4th Floor", capacity: 65, hasAC: true, hasProjector: true, hasWhiteboard: true, quietRating: "Medium", type: "Lecture Hall", primarySection: "II-ECE-DS-B" },
  { id: "IST-416", name: "IST 416", building: "IST Building", floor: 4, floorLabel: "4th Floor", capacity: 65, hasAC: true, hasProjector: true, hasWhiteboard: true, quietRating: "Medium", type: "Lecture Hall", primarySection: "II-ECE-DS-A" },
  { id: "IST-509", name: "IST 509", building: "IST Building", floor: 5, floorLabel: "5th Floor", capacity: 50, hasAC: true, hasProjector: true, hasWhiteboard: true, quietRating: "High", type: "Collaborative Study Hall" },
  { id: "IST-518", name: "IST 518", building: "IST Building", floor: 5, floorLabel: "5th Floor", capacity: 70, hasAC: true, hasProjector: true, hasWhiteboard: true, quietRating: "Low", type: "Main Lecture Auditorium", primarySection: "III-ECE-A / III-ECE-B" },
  { id: "IST-519", name: "IST 519", building: "IST Building", floor: 5, floorLabel: "5th Floor", capacity: 65, hasAC: true, hasProjector: true, hasWhiteboard: true, quietRating: "Medium", type: "Lecture Hall", primarySection: "III-ECE-DS" },
  { id: "IST-602", name: "IST 602", building: "IST Building", floor: 6, floorLabel: "6th Floor", capacity: 65, hasAC: false, hasProjector: true, hasWhiteboard: true, quietRating: "High", type: "Lecture Hall", primarySection: "II-BME / I-ECE-A" },
  { id: "IST-710", name: "IST 710", building: "IST Building", floor: 7, floorLabel: "7th Floor", capacity: 60, hasAC: true, hasProjector: true, hasWhiteboard: true, quietRating: "High", type: "Faculty Conference Room", primarySection: "I-ECE-A" }
];

export const PERIOD_TIMES = {
  1: { start: "09:00", end: "09:50", startMins: 9 * 60, endMins: 9 * 60 + 50 },
  2: { start: "09:50", end: "10:40", startMins: 9 * 60 + 50, endMins: 10 * 60 + 40 },
  3: { start: "10:50", end: "11:40", startMins: 10 * 60 + 50, endMins: 11 * 60 + 40 },
  4: { start: "11:40", end: "12:30", startMins: 11 * 60 + 40, endMins: 12 * 60 + 30 },
  5: { start: "12:30", end: "13:20", startMins: 12 * 60 + 30, endMins: 13 * 60 + 20, isLunch: true },
  6: { start: "13:20", end: "14:10", startMins: 13 * 60 + 20, endMins: 14 * 60 + 10 },
  7: { start: "14:10", end: "15:00", startMins: 14 * 60 + 10, endMins: 15 * 60 },
  8: { start: "15:10", end: "16:00", startMins: 15 * 60 + 10, endMins: 16 * 60 },
  9: { start: "16:00", end: "16:50", startMins: 16 * 60, endMins: 16 * 60 + 50 },
};

// Build room bookings matrix from timetable dataset
const buildClientRoomBookings = () => {
  const bookings = {};
  CAMPUS_ROOMS.forEach(r => {
    bookings[r.id] = { Monday: {}, Tuesday: {}, Wednesday: {}, Thursday: {}, Friday: {} };
  });

  (timetablesData.sections || []).forEach(sec => {
    const venue = sec.venue || "IST 518";
    const baseVenue = venue.split('/')[0].trim();

    (sec.subjects || []).forEach(sub => {
      (sub.schedule || []).forEach(slot => {
        const day = slot.day;
        const periods = slot.periods || [];
        const slotVenue = slot.venue ? slot.venue.split('/')[0].trim() : baseVenue;
        const roomId = slotVenue.replace(' ', '-');

        if (bookings[roomId] && bookings[roomId][day]) {
          periods.forEach(p => {
            bookings[roomId][day][p] = {
              section: sec.name,
              sectionId: sec.id,
              subjectCode: sub.code,
              subjectName: sub.name,
              faculty: sub.faculty || 'Faculty TBA'
            };
          });
        }
      });
    });
  });

  // Additional realistic bookings
  if (bookings["IST-509"]) {
    bookings["IST-509"]["Monday"][7] = { section: "M.Tech AI Lab", sectionId: "PG-AI", subjectCode: "21AIC501", subjectName: "Advanced Deep Learning", faculty: "Dr. S. K. Gupta" };
    bookings["IST-509"]["Tuesday"][8] = { section: "Project Review", sectionId: "SEEE-PR", subjectCode: "21ECE401P", subjectName: "Capstone Project Review", faculty: "Committee" };
  }

  return bookings;
};

const clientRoomBookings = buildClientRoomBookings();

export const fallbackGetRooms = (day = "Monday", currentTimeStr = "13:30", floor = null) => {
  let curMins = 13 * 60 + 30;
  try {
    const parts = currentTimeStr.split(":");
    curMins = parseInt(parts[0]) * 60 + (parts[1] ? parseInt(parts[1]) : 0);
  } catch (e) {}

  let currentPeriod = 6;
  for (const [p, info] of Object.entries(PERIOD_TIMES)) {
    if (info.startMins <= curMins && curMins < info.endMins) {
      currentPeriod = parseInt(p);
      break;
    }
  }

  return CAMPUS_ROOMS.filter(r => floor === null || floor === undefined || r.floor === parseInt(floor)).map(room => {
    const dayBookings = (clientRoomBookings[room.id] || {})[day] || {};
    const currentBooking = dayBookings[currentPeriod];
    const isOccupied = Boolean(currentBooking);

    let freeUntilStr = "17:00";
    let freeUntilMins = 17 * 60;
    let minutesLeft = 0;
    let nextClass = null;
    let status = "FREE";
    let statusColor = "green";

    if (isOccupied) {
      let blockEnd = currentPeriod;
      while (dayBookings[blockEnd + 1]) blockEnd++;
      const endInfo = PERIOD_TIMES[blockEnd] || PERIOD_TIMES[9];
      freeUntilStr = endInfo.end;
      minutesLeft = Math.max(0, endInfo.endMins - curMins);
      status = "OCCUPIED";
      statusColor = "red";
    } else {
      let nextPeriod = null;
      for (let p = currentPeriod + 1; p <= 9; p++) {
        if (dayBookings[p]) { nextPeriod = p; break; }
      }
      if (nextPeriod) {
        const nextInfo = PERIOD_TIMES[nextPeriod];
        freeUntilStr = nextInfo.start;
        freeUntilMins = nextInfo.startMins;
        minutesLeft = Math.max(0, freeUntilMins - curMins);
        nextClass = dayBookings[nextPeriod];
        if (minutesLeft <= 30) {
          status = "ENDING_SOON";
          statusColor = "amber";
        } else {
          status = "FREE";
          statusColor = "green";
        }
      } else {
        freeUntilStr = "17:00";
        freeUntilMins = 17 * 60;
        minutesLeft = Math.max(0, freeUntilMins - curMins);
        status = "FREE";
        statusColor = "green";
      }
    }

    const h = parseInt(freeUntilStr.split(":")[0]);
    const m = freeUntilStr.split(":")[1];
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h > 12 ? h - 12 : h;
    const displayFreeUntil = `${displayH}:${m} ${ampm}`;

    return {
      ...room,
      status,
      statusColor,
      currentPeriod,
      currentBooking,
      nextClass,
      freeUntil: displayFreeUntil,
      freeUntilRaw: freeUntilStr,
      minutesLeft,
      secondsLeft: minutesLeft * 60,
      countdownText: minutesLeft >= 60 ? `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m` : `${minutesLeft}m`,
      squadMessage: `Heading to ${room.name}. It's free until ${displayFreeUntil}. Come fast!`
    };
  });
};

export const fallbackGetFloors = () => {
  const map = {};
  CAMPUS_ROOMS.forEach(r => {
    if (!map[r.floor]) {
      map[r.floor] = { floor: r.floor, label: r.floorLabel, rooms: [] };
    }
    map[r.floor].rooms.push(r.name);
  });
  return Object.values(map).sort((a, b) => a.floor - b.floor);
};

export const fallbackGetRoomSchedule = (roomId) => {
  const room = CAMPUS_ROOMS.find(r => r.id === roomId);
  return {
    room,
    weeklySchedule: clientRoomBookings[roomId] || {},
    periodTimes: PERIOD_TIMES
  };
};

export const fallbackSearchRoomsWithAI = (query, day = "Monday", currentTimeStr = "13:30") => {
  const q = (query || "").toLowerCase();

  let targetFloor = null;
  if (q.includes("ground") || q.includes("1st floor") || q.includes("floor 1") || q.includes("first floor")) targetFloor = 1;
  else if (q.includes("2nd floor") || q.includes("floor 2") || q.includes("second floor")) targetFloor = 2;
  else if (q.includes("3rd floor") || q.includes("floor 3") || q.includes("third floor")) targetFloor = 3;
  else if (q.includes("4th floor") || q.includes("floor 4") || q.includes("fourth floor")) targetFloor = 4;
  else if (q.includes("5th floor") || q.includes("floor 5") || q.includes("fifth floor")) targetFloor = 5;
  else if (q.includes("6th floor") || q.includes("floor 6") || q.includes("sixth floor")) targetFloor = 6;
  else if (q.includes("7th floor") || q.includes("floor 7") || q.includes("seventh floor")) targetFloor = 7;

  let durationHours = 1.0;
  const match = q.match(/(\d+)\s*(?:hour|hr|hours|hrs)/);
  if (match) durationHours = parseFloat(match[1]);
  else if (q.includes("two hours") || q.includes("couple of hours")) durationHours = 2.0;
  else if (q.includes("three hours")) durationHours = 3.0;

  const reqMins = Math.round(durationHours * 60);
  const reqAC = q.includes("ac") || q.includes("air condition") || q.includes("cool");
  const reqProjector = q.includes("projector") || q.includes("screen") || q.includes("presentation");
  const reqTeam = q.includes("team") || q.includes("group") || q.includes("squad");
  const reqQuiet = q.includes("quiet") || q.includes("silent") || q.includes("study") || q.includes("focus");

  const allRooms = fallbackGetRooms(day, currentTimeStr);
  const ranked = [];

  allRooms.forEach(r => {
    if (r.status !== 'FREE' || r.minutesLeft < reqMins) return;

    let score = 100;
    const reasons = [];

    if (targetFloor !== null) {
      if (r.floor === targetFloor) {
        score += 50;
        reasons.push(`Located exactly on ${r.floorLabel}`);
      } else {
        score -= 40;
      }
    } else {
      reasons.push(`Located on ${r.floorLabel}`);
    }

    if (reqAC) {
      if (r.hasAC) { score += 30; reasons.push("Air-conditioned (AC enabled)"); }
      else score -= 50;
    }

    if (reqProjector) {
      if (r.hasProjector) { score += 25; reasons.push("Equipped with HD Projector"); }
      else score -= 30;
    }

    if (reqTeam) {
      if (r.capacity >= 40) { score += 20; reasons.push(`Spacious seating for ${r.capacity} team members`); }
      else reasons.push(`Capacity for ${r.capacity} members`);
    }

    if (reqQuiet && r.quietRating === "High") {
      score += 20;
      reasons.push("Designated high-focus quiet zone");
    }

    reasons.push(`Guaranteed free for ${r.countdownText} (until ${r.freeUntil})`);

    ranked.push({
      ...r,
      matchScore: Math.min(99, Math.max(60, score)),
      matchReason: reasons.join(" • ")
    });
  });

  ranked.sort((a, b) => b.matchScore - a.matchScore || b.minutesLeft - a.minutesLeft);

  return {
    query,
    parsedParams: {
      targetFloor,
      durationHours,
      requiredMinutes: reqMins,
      requiresAC: reqAC,
      requiresProjector: reqProjector,
      isTeamGroup: reqTeam,
      requiresQuiet: reqQuiet,
      day,
      referenceTime: currentTimeStr
    },
    matchCount: ranked.length,
    topMatches: ranked.slice(0, 6)
  };
};
