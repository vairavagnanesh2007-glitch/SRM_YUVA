from typing import Dict, Any, List, Optional
from backend.services.timetable_service import timetable_service
from backend.services.date_engine import date_engine
from backend.calculation.attendance_engine import attendance_engine

class DashboardService:
    """
    Multi-Subject Semester Health Dashboard Service.
    Aggregates attendance health, 75%/90% status, safe-to-miss allowances,
    and visual chart data across all subjects in a section.
    """

    def __init__(self):
        self.timetable_svc = timetable_service
        self.date_eng = date_engine
        self.engine = attendance_engine

    def get_section_dashboard(
        self,
        section_id: str,
        today_date: Optional[str] = None,
        subject_overrides: Optional[Dict[str, Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Computes holistic multi-subject attendance status for all courses in the section.
        """
        today_str = today_date or "2026-09-28"
        section = self.timetable_svc.get_section(section_id)
        if not section:
            raise ValueError(f"Section '{section_id}' not found.")

        subjects = self.timetable_svc.get_section_subjects(section_id)
        subject_cards: List[Dict[str, Any]] = []

        status_counts = {"SAFE": 0, "WATCH": 0, "DANGER": 0, "IRREVERSIBLE_DETENTION": 0}
        total_pct_sum = 0.0
        total_conducted_sum = 0
        total_attended_sum = 0

        # Sample realistic default percentages for demo if no overrides provided:
        # e.g., first subject 68% (to demo danger), second 88%, third 94%, etc.
        demo_percentages = [68.0, 84.0, 92.0, 78.0, 73.0, 89.0, 95.0, 71.0, 85.0]

        for idx, subj in enumerate(subjects):
            code = subj["code"]
            counts = self.date_eng.get_timetable_counts(section_id, code, today_str)
            C_sched = counts["conductedCount"]
            R_sched = counts["remainingCount"]

            override = (subject_overrides or {}).get(code, {})
            if override and "classesConducted" in override and "classesAttended" in override:
                C = int(override["classesConducted"])
                A = int(override["classesAttended"])
            elif override and "attendancePercentage" in override:
                pct = float(override["attendancePercentage"])
                C = C_sched if C_sched > 0 else 25
                A = int(round((pct * C) / 100.0))
            else:
                default_pct = demo_percentages[idx % len(demo_percentages)]
                C = C_sched if C_sched > 0 else 25
                A = int(round((default_pct * C) / 100.0))

            R = R_sched
            metrics = self.engine.calculate_attendance_metrics(C, A, R)

            status = metrics["status"]
            status_counts[status] = status_counts.get(status, 0) + 1
            total_pct_sum += metrics["currentAttendance"]
            total_conducted_sum += C
            total_attended_sum += A

            subject_cards.append({
                "code": code,
                "name": subj["name"],
                "slot": subj.get("slot"),
                "credit": subj.get("credit", "3-0-0-3"),
                "faculty": subj.get("faculty"),
                "designation": subj.get("designation"),
                "conducted": C,
                "attended": A,
                "absent": metrics["classesAbsent"],
                "remaining": R,
                "totalSemesterClasses": C + R,
                "currentAttendance": metrics["currentAttendance"],
                "maximumPossible": metrics["maximumPossibleAttendance"],
                "status": status,
                "statusLabel": metrics["statusLabel"],
                "statusColor": metrics["statusColor"],
                "target75": metrics["target75"],
                "target90": metrics["target90"],
                "safeToMiss75": metrics["target75"]["safeToMiss"],
                "requiredFor75": metrics["target75"]["requiredToAttend"]
            })

        count = len(subject_cards)
        overall_avg = round(total_pct_sum / count, 1) if count > 0 else 0.0

        # Calculate overall health score (0-100)
        # Weighted by danger subjects and average percentage
        danger_count = status_counts["DANGER"] + status_counts["IRREVERSIBLE_DETENTION"]
        health_score = max(0, min(100, int(overall_avg - (danger_count * 10))))

        # Bar chart comparison data
        bar_chart_data = [
            {
                "subject": s["code"],
                "name": s["name"][:18] + ("..." if len(s["name"]) > 18 else ""),
                "current": s["currentAttendance"],
                "maxPossible": s["maximumPossible"],
                "target75": 75,
                "target90": 90,
                "status": s["status"]
            }
            for s in subject_cards
        ]

        # Donut chart distribution
        distribution = [
            {"name": "Safe (>=80%)", "value": status_counts["SAFE"], "color": "#10b981"},
            {"name": "Watch (75-79%)", "value": status_counts["WATCH"], "color": "#f59e0b"},
            {"name": "Danger (<75%)", "value": status_counts["DANGER"], "color": "#f97316"},
            {"name": "Detained (<75% max)", "value": status_counts["IRREVERSIBLE_DETENTION"], "color": "#ef4444"}
        ]

        return {
            "sectionId": section_id,
            "sectionName": section["name"],
            "batch": section["batch"],
            "venue": section["venue"],
            "referenceDate": today_str,
            "summary": {
                "overallAverage": overall_avg,
                "healthScore": health_score,
                "totalSubjects": count,
                "safeSubjectsCount": status_counts["SAFE"],
                "watchSubjectsCount": status_counts["WATCH"],
                "dangerSubjectsCount": status_counts["DANGER"],
                "detainedSubjectsCount": status_counts["IRREVERSIBLE_DETENTION"],
                "totalConductedClasses": total_conducted_sum,
                "totalAttendedClasses": total_attended_sum
            },
            "subjects": subject_cards,
            "charts": {
                "barChart": bar_chart_data,
                "distribution": distribution
            }
        }

dashboard_service = DashboardService()
