---
name: attendance-hackathon
description: >-
  Authoritative engineering guidelines, mathematical rules, and workflow protocols
  for the Overworld Hackathon Attendance Predictor project. Automatically activate
  this skill whenever working on attendance calculations, timetable processing,
  class scheduling, attendance prediction, recovery horizons, safe miss limits,
  irreversible detention checks, What-If simulations, or hackathon testing and demo preparation.
---

# Overworld Hackathon — Attendance Predictor Skill

This skill governs all development, maintenance, algorithmic updates, and testing for the **Attendance Predictor** project (Overworld Hackathon Phase 1).

All agents and contributors working on this workspace must strictly adhere to the following **25 Authoritative Rules**.

---

## 🏛️ Ground-Truth & Data Integrity Rules

### Rule 1: The Official Problem Statement Images are the Source of Truth
- The problem statement images located in `problem_statement/` define all scope boundaries, semester dates, required metrics, and product requirements.
- Never override or contradict the specifications shown in the official images.

### Rule 2: `dataset/timetables.zip` is the Source of Truth for Timetable Information
- All section metadata, course allocations, faculty names, classroom venues, and period grids must originate from the 10 official scanned PDF timetables inside `dataset/timetables.zip` (normalized in `backend/data/timetables.json`).
- If new timetable data is required, it must be extracted directly from this dataset.

### Rule 3: Never Invent Timetable Data
- Do not fabricate class schedules, period timings, room numbers, or course codes.
- Every period slot must correspond to an actual entry in the verified dataset.

### Rule 4: Never Approximate Scheduled Class Counts
- Do not estimate total classes using weekly multipliers or rough averages (e.g., "14 weeks × 4 classes").
- Scheduled classes must be counted by exact calendar iteration against the section's actual schedule.

### Rule 5: Always Calculate Actual Class Occurrences from First Principles
- Every class count must be computed by traversing:
  $$\text{Calendar Date} \longrightarrow \text{Day of Week} \longrightarrow \text{Section Timetable} \longrightarrow \text{Period Slot} \longrightarrow \text{Subject Code}$$
- This accounts for multi-period blocks on the same day (e.g. Wednesday periods 6 & 7) and skips non-instructional days or dates outside the semester window.

### Rule 6: Semester Dates Must Come from the Official Problem Statement
- **Semester Start:** `2026-08-29`
- **Semester End:** `2026-11-29`
- **Default Reference Date ("Today"):** `2026-09-28`
- Do not use arbitrary or ungrounded date boundaries.

---

## 📐 Mathematical Precision & Determinism Rules

### Rule 7: 75% and 90% Calculations Must Use Exact Integer Mathematics
- Attendance requirements and limits must be computed in integer space.
- Floating-point arithmetic must include an epsilon buffer ($\epsilon = 10^{-9}$) to eliminate floating-point representation artifacts (e.g. `39.00000000000001` accidentally rounding up to `40`).

### Rule 8: Required Classes Must Use Ceiling
- For target percentage $T \in \{0.75, 0.90\}$ and total semester classes $N = C + R$:
  $$\text{TargetClasses} = \lceil T \times N - \epsilon \rceil$$
  $$\text{RequiredToAttend} = \max(0, \text{TargetClasses} - A)$$
- A student cannot attend a partial class; required counts must always be integers.

### Rule 9: Never Return Negative or Fractional Class Counts
- Negative values must be clamped to $0$ using $\max(0, \dots)$.
- Fractional values (e.g. `3.4 classes`) or `NaN` outputs are strictly prohibited and violate product specifications.

### Rule 10: Detect Mathematically Impossible 75% Recovery
- If $\text{RequiredToAttend}(75\%) > R$ or $\text{MaxPossible} < 75.0\%$:
  - Flag state as **`IRREVERSIBLE_DETENTION`**.
  - Set `target75.possible = False`.
  - Set `target75.safeToMiss = 0`.
  - Trigger loud visual and audible detention warnings.

### Rule 11: Detect Mathematically Impossible 90% Recovery
- If $\text{RequiredToAttend}(90\%) > R$:
  - Set `target90.possible = False`.
  - Explicitly label 90% target as **`UNREACHABLE`**.
  - Do not let 90% impossibility prevent or distort 75% calculations.

### Rule 12: Calculate Maximum Possible Attendance
- Compute the ceiling of achievement if the student attends 100% of all $R$ remaining classes:
  $$\text{MaxPossible} = \begin{cases} 100.0\% & \text{if } C + R = 0 \\ \operatorname{round}\left(\frac{A + R}{C + R} \times 100, 1\right) & \text{if } C + R > 0 \end{cases}$$

### Rule 13: Calculate How Many Classes Can Safely Be Missed
- For target $T = 75\%$:
  $$\text{SafeToMiss} = \begin{cases} 0 & \text{if } \text{RequiredToAttend} > R \\ R - \text{RequiredToAttend} & \text{if } \text{RequiredToAttend} \le R \end{cases}$$
- This represents the exact budget of classes a student can skip while remaining $\ge 75.0\%$.

### Rule 14: Future-Date Planning Must Use the Actual Timetable
- In the "Plan My Attendance Until [Date]" feature, the remaining classes $R$ must be calculated by counting occurrences from `todayDate` strictly up to `planningDate`.
- The planner must reflect the actual timetable occurrences within that specific window.

### Rule 15: What-If Simulations Must Use the Same Authoritative Calculation Engine
- What-If simulations must invoke `attendance_engine.calculate_attendance_metrics(...)` with updated conducted and attended state $(C', A', R')$.
- Never implement separate or approximate math inside simulation handlers.

---

## 🏗️ Architectural Separation & Code Boundaries

### Rule 16: Keep Frontend and Backend Strictly Separated
- `backend/` handles data loading, timetable lookups, calendar traversal, calculations, and simulations.
- `frontend/` handles routing, presentation, charts, gauges, animations, and user interaction.

### Rule 17: Frontend Must Not Duplicate Authoritative Attendance Calculations
- The React application must never calculate `requiredClasses`, `safeToMiss`, or detention status in JavaScript.
- All values displayed in the UI must be received directly from the backend API.

### Rule 18: Backend Must Be the Source of Truth for Calculations
- All business logic, algorithms, thresholds, and data transformations reside in:
  - `backend/calculation/attendance_engine.py`
  - `backend/services/date_engine.py`
  - `backend/services/attendance_service.py`

### Rule 19: Do Not Invent Phase 2 Functionality
- Phase 2 features (hypothetical predictive attendance modeling, multi-semester projections, automated SMS notifications, etc.) are outside the Phase 1 scope.
- Keep the application focused on the Phase 1 Attendance Predictor requirements.

### Rule 20: Do Not Add Unrelated Features
- Avoid scope creep (e.g. grading portals, assignment managers, fee payments).
- Every feature must directly serve the attendance decision and prediction engine.

---

## 🧪 Testing, Quality & Hackathon Demo Readiness

### Rule 21: Before Changing Core Calculation Logic, Test Existing Functionality
- Run existing automated test suites before modifying `attendance_engine.py` or services:
  ```bash
  python -m pytest backend/tests -v
  ```

### Rule 22: After Significant Changes, Run Frontend and Backend Tests
- Backend verification: All 17 unit and integrity tests in `backend/tests/` must pass.
- Frontend verification: Run `npm run build` in `frontend/` to confirm zero compilation or lint errors.

### Rule 23: Check Browser Console and Backend Errors
- Ensure zero uncaught JavaScript errors in browser DevTools.
- Verify FastAPI logs return HTTP 200/201 without unhandled 500 exceptions.

### Rule 24: Preserve Working Functionality Unless Required by the Official Problem
- Refactoring must not break existing working components:
  - `RecoveryGauge.jsx`
  - `WhatIfSimulator.jsx`
  - `MathematicalProof.jsx`
  - `UpcomingClasses.jsx`
  - `AttendanceCalendar.jsx`
  - `TimetablePage.jsx`

### Rule 25: Optimize the Final Application for a Live Hackathon Demo
- Ensure sub-second calculation response times.
- Keep the one-click **Judge Demo Presets** fully functional for live judging:
  1. *Scenario 1: 68% Danger Zone (Recoverable)*
  2. *Scenario 2: 🚨 Irreversible Detention (Impossible)*
  3. *Scenario 3: 90% Target Unreachable, 75% Safe*
  4. *Scenario 4: 92% Safe High Flier*
- Maintain polished visuals: tactical CRT terminal styling, high contrast, clean badges, and celebration confetti for safe standings.
