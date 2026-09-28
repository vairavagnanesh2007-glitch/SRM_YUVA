from typing import Dict, Any, List, Optional
from datetime import datetime, date
from backend.calculation.attendance_engine import calculate_attendance_metrics
from backend.services.timetable_service import timetable_service
from backend.services.date_engine import date_engine

class AttendanceService:
    def __init__(self):
        self.timetable_svc = timetable_service
        self.date_eng = date_engine

    def resolve_today(self, today_param: Optional[str]) -> str:
        if today_param:
            return today_param
        # Default to current local time or semester start if today is earlier
        now_str = datetime.now().strftime("%Y-%m-%d")
        sem_start = self.timetable_svc.semester_start
        sem_end = self.timetable_svc.semester_end
        if now_str < sem_start:
            return sem_start
        if now_str > sem_end:
            return sem_end
        return now_str

    def calculate_attendance_plan(
        self,
        section_id: str,
        subject_code: str,
        attendance_percentage: Optional[float] = None,
        classes_conducted: Optional[int] = None,
        classes_attended: Optional[int] = None,
        today_date: Optional[str] = None,
        planning_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes end-to-end timetable-based attendance prediction.
        """
        today_str = self.resolve_today(today_date)
        plan_str = planning_date or self.timetable_svc.semester_end

        # 1. Fetch section and subject metadata
        section = self.timetable_svc.get_section(section_id)
        if not section:
            raise ValueError(f"Section '{section_id}' is invalid.")

        subject = self.timetable_svc.get_subject(section_id, subject_code)
        if not subject:
            raise ValueError(f"Subject '{subject_code}' not found in section '{section_id}'.")

        # 2. Derive real timetable scheduled counts
        counts = self.date_eng.get_timetable_counts(
            section_id=section_id,
            subject_code=subject_code,
            today_str=today_str,
            planning_date_str=plan_str
        )

        timetable_conducted = counts["conductedCount"]
        timetable_remaining = counts["remainingCount"]

        # 3. Determine C and A
        # Mode 2 (Exact) takes priority over Mode 1 (Simple)
        if classes_conducted is not None and classes_attended is not None:
            C = int(classes_conducted)
            A = int(classes_attended)
            if C < 0:
                raise ValueError("Conducted classes cannot be negative.")
            if A < 0 or A > C:
                raise ValueError("Attended classes must be between 0 and conducted classes.")
            input_mode = "EXACT"
        elif attendance_percentage is not None:
            pct = float(attendance_percentage)
            if pct < 0.0 or pct > 100.0:
                raise ValueError("Attendance percentage must be between 0 and 100.")
            C = timetable_conducted
            A = round(C * (pct / 100.0))
            input_mode = "SIMPLE"
        else:
            raise ValueError("Either attendance percentage or (conducted, attended) counts must be provided.")

        R = timetable_remaining

        # 4. Authority Calculation Engine
        metrics = calculate_attendance_metrics(
            classes_conducted=C,
            classes_attended=A,
            classes_remaining=R
        )

        # 5. Full semester metrics if planning date is an intermediate date
        if counts["remainingCount"] != counts["fullSemesterRemainingCount"]:
            full_metrics = calculate_attendance_metrics(
                classes_conducted=C,
                classes_attended=A,
                classes_remaining=counts["fullSemesterRemainingCount"]
            )
        else:
            full_metrics = metrics

        # 6. Fetch upcoming classes (next 12 scheduled slots)
        all_remaining = counts["fullRemainingClasses"]
        upcoming_classes = all_remaining[:15]

        # 7. Generate interactive calendar matrix
        calendar_days = self.date_eng.generate_calendar_days(
            section_id=section_id,
            subject_code=subject_code,
            today_str=today_str,
            planning_date_str=plan_str
        )

        # 8. Timeline metrics
        sem_start_dt = self.date_eng.parse_date(self.timetable_svc.semester_start)
        sem_end_dt = self.date_eng.parse_date(self.timetable_svc.semester_end)
        today_dt = self.date_eng.parse_date(today_str)
        plan_dt = self.date_eng.parse_date(plan_str)

        total_days = (sem_end_dt - sem_start_dt).days + 1
        days_elapsed = max(0, min(total_days, (today_dt - sem_start_dt).days + 1))
        days_remaining = max(0, (sem_end_dt - today_dt).days)

        timeline = {
            "semesterStart": self.timetable_svc.semester_start,
            "semesterEnd": self.timetable_svc.semester_end,
            "todayDate": today_str,
            "planningDate": plan_str,
            "totalSemesterDays": total_days,
            "daysElapsed": days_elapsed,
            "daysRemaining": days_remaining,
            "percentDaysElapsed": round((days_elapsed / total_days) * 100, 1) if total_days > 0 else 0.0,
            "totalScheduledClasses": C + counts["fullSemesterRemainingCount"],
            "classesCompleted": C,
            "classesRemaining": counts["fullSemesterRemainingCount"],
            "planningWindowClasses": R
        }

        # 9. Comparison: Traditional Portal vs Overworld Attendance Predictor
        comparison = {
            "traditional": {
                "display": f"Current Attendance: {metrics['currentAttendance']}%",
                "attended": A,
                "conducted": C,
                "actionableAdvice": "None. Only historical status displayed."
            },
            "predictor": {
                "current": f"{metrics['currentAttendance']}%",
                "remaining": R,
                "mustAttendFor75": metrics["target75"]["requiredToAttend"],
                "safeToMiss75": metrics["target75"]["safeToMiss"],
                "mustAttendFor90": metrics["target90"]["requiredToAttend"],
                "safeToMiss90": metrics["target90"]["safeToMiss"],
                "maxPossible": f"{metrics['maximumPossibleAttendance']}%",
                "status": metrics["statusLabel"],
                "actionableAdvice": (
                    "From information to strategic decision: attend exact required classes and safely miss without risking detention."
                )
            }
        }

        return {
            "section": {
                "id": section["id"],
                "name": section["name"],
                "batch": section["batch"],
                "venue": section["venue"]
            },
            "subject": {
                "code": subject["code"],
                "name": subject["name"],
                "slot": subject.get("slot"),
                "faculty": subject.get("faculty"),
                "credit": subject.get("credit")
            },
            "inputMode": input_mode,
            "calculation": metrics,
            "fullSemesterCalculation": full_metrics,
            "upcomingClasses": upcoming_classes,
            "calendar": calendar_days,
            "timeline": timeline,
            "comparison": comparison
        }

    def simulate_what_if(
        self,
        classes_conducted: int,
        classes_attended: int,
        classes_remaining: int,
        attend_next: int = 0,
        miss_next: int = 0
    ) -> Dict[str, Any]:
        """
        Real-time What-If simulator.
        Simulates attending `attend_next` classes and missing `miss_next` classes.
        """
        C = max(0, int(classes_conducted))
        A = max(0, min(C, int(classes_attended)))
        R = max(0, int(classes_remaining))

        sim_attended = max(0, int(attend_next))
        sim_missed = max(0, int(miss_next))

        total_simulated = sim_attended + sim_missed
        if total_simulated > R:
            # Clamp to remaining
            scale = R / total_simulated if total_simulated > 0 else 0
            sim_attended = round(sim_attended * scale)
            sim_missed = R - sim_attended

        # Simulated new state
        new_C = C + (sim_attended + sim_missed)
        new_A = A + sim_attended
        new_R = R - (sim_attended + sim_missed)

        # Baseline metrics (before simulation)
        baseline = calculate_attendance_metrics(C, A, R)

        # Simulated metrics (after simulating these classes)
        projected = calculate_attendance_metrics(new_C, new_A, new_R)

        # Difference
        attendance_diff = round(projected["currentAttendance"] - baseline["currentAttendance"], 2)

        return {
            "simulationParams": {
                "attendNext": sim_attended,
                "missNext": sim_missed,
                "totalSimulated": sim_attended + sim_missed
            },
            "baseline": baseline,
            "projected": projected,
            "impact": {
                "attendanceChange": attendance_diff,
                "statusChanged": baseline["status"] != projected["status"],
                "newStatus": projected["status"],
                "isDetentionTriggered": (
                    baseline["status"] != "IRREVERSIBLE_DETENTION" and
                    projected["status"] == "IRREVERSIBLE_DETENTION"
                ),
                "remainingSafeMisses75": projected["target75"]["safeToMiss"],
                "remainingSafeMisses90": projected["target90"]["safeToMiss"]
            }
        }

attendance_service = AttendanceService()
