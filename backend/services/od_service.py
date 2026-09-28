from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from backend.services.timetable_service import timetable_service
from backend.services.date_engine import date_engine
from backend.calculation.attendance_engine import attendance_engine

class ODService:
    """
    On-Duty (OD) and Medical Leave (ML) Simulation Service.
    Calculates exact timetable periods impacted during leave dates and
    recomputes attendance percentage, safe-miss allowances, and detention recovery.
    """

    def __init__(self):
        self.timetable_svc = timetable_service
        self.date_eng = date_engine
        self.engine = attendance_engine

    def simulate_leave(
        self,
        section_id: str,
        leave_type: str,  # "ON_DUTY" or "MEDICAL_LEAVE"
        start_date: str,
        end_date: str,
        reason: str = "Academic / College Event",
        policy: str = "CONVERT_TO_ATTENDED",  # "CONVERT_TO_ATTENDED" or "EXEMPT_FROM_CONDUCTED"
        target_subject_codes: Optional[List[str]] = None,
        subject_stats: Optional[Dict[str, Dict[str, Any]]] = None,
        reference_today: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Simulate an OD or Medical Leave application across a calendar window.
        """
        today_str = reference_today or "2026-09-28"
        section = self.timetable_svc.get_section(section_id)
        if not section:
            raise ValueError(f"Section '{section_id}' not found.")

        # Parse date range
        start_dt = self.date_eng.parse_date(start_date)
        end_dt = self.date_eng.parse_date(end_date)
        if end_dt < start_dt:
            raise ValueError("End date cannot be earlier than start date.")

        sem_start_dt = self.date_eng.parse_date(self.timetable_svc.semester_start)
        sem_end_dt = self.date_eng.parse_date(self.timetable_svc.semester_end)

        # Clamp range to semester boundaries
        effective_start = max(start_dt, sem_start_dt)
        effective_end = min(end_dt, sem_end_dt)

        if effective_start > effective_end:
            raise ValueError("Selected leave dates fall entirely outside the semester window.")

        # Find all scheduled periods that occur in the leave window
        period_breakdown: List[Dict[str, Any]] = []
        subject_period_counts: Dict[str, int] = {}

        curr = effective_start
        total_calendar_days = (end_dt - start_dt).days + 1
        academic_days = 0

        while curr <= effective_end:
            date_str = curr.strftime("%Y-%m-%d")
            day_name = curr.strftime("%A")
            day_schedule = self.timetable_svc.get_day_schedule(section_id, day_name)

            if day_schedule:
                academic_days += 1
                for item in day_schedule:
                    subj_code = item["subjectCode"]
                    # If target subjects specified and not "ALL", filter
                    if target_subject_codes and "ALL" not in target_subject_codes and subj_code not in target_subject_codes:
                        continue

                    period_info = {
                        "date": date_str,
                        "day": day_name,
                        "period": item["period"],
                        "time": item.get("time", "Scheduled Period"),
                        "subjectCode": subj_code,
                        "subjectName": item["subjectName"],
                        "slot": item.get("slot"),
                        "venue": item.get("venue", section.get("venue")),
                        "faculty": item.get("faculty")
                    }
                    period_breakdown.append(period_info)
                    subject_period_counts[subj_code] = subject_period_counts.get(subj_code, 0) + 1

            curr += timedelta(days=1)

        # Now compute impact for each subject
        all_subjects = self.timetable_svc.get_section_subjects(section_id)
        subject_impacts = []
        detention_rescued_count = 0
        total_od_periods = len(period_breakdown)

        for subj in all_subjects:
            code = subj["code"]
            # Skip if filtering by specific subjects
            if target_subject_codes and "ALL" not in target_subject_codes and code not in target_subject_codes:
                continue

            # Determine baseline conducted, attended, remaining
            counts = self.date_eng.get_timetable_counts(section_id, code, today_str)
            C_sched = counts["conductedCount"]
            R_sched = counts["remainingCount"]

            # Check if user provided custom stats
            custom = (subject_stats or {}).get(code, {})
            if custom and "classesConducted" in custom and "classesAttended" in custom:
                C = int(custom["classesConducted"])
                A = int(custom["classesAttended"])
            elif custom and "attendancePercentage" in custom:
                pct = float(custom["attendancePercentage"])
                C = C_sched
                A = int(round((pct * C) / 100.0))
            else:
                # Default simulation baseline: 68% attendance to demonstrate recovery
                C = C_sched if C_sched > 0 else 25
                A = int(round(0.68 * C))

            R = R_sched

            # Baseline calculation
            baseline_calc = self.engine.calculate_attendance_metrics(
                classes_conducted=C,
                classes_attended=A,
                classes_remaining=R
            )

            od_count = subject_period_counts.get(code, 0)

            # Apply Policy
            if policy == "EXEMPT_FROM_CONDUCTED":
                # Medical Leave: classes are subtracted from conducted total
                C_new = max(A, C - od_count)
                A_new = A
                R_new = max(0, R)
            else:
                # Standard On-Duty: student is awarded attendance credit for missed periods
                C_new = C
                A_new = min(C + R, A + od_count)
                R_new = R

            post_calc = self.engine.calculate_attendance_metrics(
                classes_conducted=C_new,
                classes_attended=A_new,
                classes_remaining=R_new
            )

            # Impact analysis
            att_diff = round(post_calc["currentAttendance"] - baseline_calc["currentAttendance"], 1)
            was_detained = baseline_calc["status"] == "IRREVERSIBLE_DETENTION" or baseline_calc["currentAttendance"] < 75.0
            is_now_safe = post_calc["status"] == "SAFE" or (post_calc["target75"]["possible"] and post_calc["currentAttendance"] >= 75.0)

            rescued = was_detained and is_now_safe
            if rescued:
                detention_rescued_count += 1

            subject_impacts.append({
                "subjectCode": code,
                "subjectName": subj["name"],
                "slot": subj.get("slot"),
                "faculty": subj.get("faculty"),
                "odPeriodsCount": od_count,
                "baseline": {
                    "classesConducted": C,
                    "classesAttended": A,
                    "attendancePercentage": baseline_calc["currentAttendance"],
                    "status": baseline_calc["status"],
                    "statusLabel": baseline_calc["statusLabel"],
                    "safeToMiss75": baseline_calc["target75"]["safeToMiss"],
                    "requiredFor75": baseline_calc["target75"]["requiredToAttend"]
                },
                "postLeave": {
                    "classesConducted": C_new,
                    "classesAttended": A_new,
                    "attendancePercentage": post_calc["currentAttendance"],
                    "status": post_calc["status"],
                    "statusLabel": post_calc["statusLabel"],
                    "safeToMiss75": post_calc["target75"]["safeToMiss"],
                    "requiredFor75": post_calc["target75"]["requiredToAttend"]
                },
                "impact": {
                    "attendanceDelta": att_diff,
                    "percentageIncreased": att_diff > 0,
                    "safeMissDelta": post_calc["target75"]["safeToMiss"] - baseline_calc["target75"]["safeToMiss"],
                    "detentionRescued": rescued
                }
            })

        # Generate formal OD Application Draft Letter
        formal_letter = self._generate_od_letter(
            section=section,
            leave_type=leave_type,
            reason=reason,
            start_date=start_date,
            end_date=end_date,
            academic_days=academic_days,
            total_periods=total_od_periods,
            period_breakdown=period_breakdown
        )

        return {
            "sectionId": section_id,
            "sectionName": section["name"],
            "leaveType": leave_type,
            "reason": reason,
            "policy": policy,
            "dateRange": {
                "startDate": start_date,
                "endDate": end_date,
                "totalCalendarDays": total_calendar_days,
                "academicDays": academic_days
            },
            "totalPeriodsApproved": total_od_periods,
            "periodBreakdown": period_breakdown,
            "subjectImpacts": subject_impacts,
            "summary": {
                "totalSubjectsImpacted": len([s for s in subject_impacts if s["odPeriodsCount"] > 0]),
                "totalODPeriods": total_od_periods,
                "detentionRescuedCount": detention_rescued_count,
                "overallAdvice": (
                    f"Approved {total_od_periods} periods of {leave_type.replace('_', ' ')}. "
                    f"{detention_rescued_count} course(s) successfully rescued from detention zone."
                    if detention_rescued_count > 0 else
                    f"Successfully applied {total_od_periods} periods of {leave_type.replace('_', ' ')}."
                )
            },
            "officialLetter": formal_letter
        }

    def _generate_od_letter(
        self,
        section: Dict[str, Any],
        leave_type: str,
        reason: str,
        start_date: str,
        end_date: str,
        academic_days: int,
        total_periods: int,
        period_breakdown: List[Dict[str, Any]]
    ) -> str:
        """Generates a formal On-Duty / Medical Leave application letter."""
        title = "APPLICATION FOR ON-DUTY (OD) ATTENDANCE APPROVAL" if leave_type == "ON_DUTY" else "APPLICATION FOR MEDICAL LEAVE ATTENDANCE EXEMPTION"
        
        subjects_affected = set(p["subjectCode"] + " - " + p["subjectName"] for p in period_breakdown)
        subj_list_str = "\n".join(f"  • {s}" for s in sorted(subjects_affected)) or "  • None"

        return f"""================================================================================
SRM INSTITUTE OF SCIENCE AND TECHNOLOGY
Faculty of Engineering and Technology — School of Electrical & Electronics Engineering
{title}
================================================================================

Date: {datetime.now().strftime('%d %B %Y')}

To:
The Head of the Department / Faculty Advisor,
{section.get('name', 'SEEE Department')},
SRM Institute of Science and Technology.

Respected Sir / Madam,

Sub: Request for grant of {leave_type.replace('_', ' ')} attendance from {start_date} to {end_date} — Reg.

I am writing to formally request attendance credit under the {leave_type.replace('_', ' ')} regulations of SRM Institute of Science and Technology.

Details of Leave:
--------------------------------------------------------------------------------
1. Class / Section:        {section.get('name')} ({section.get('batch')})
2. Venue / Room:           {section.get('venue')}
3. Leave Type:             {leave_type.replace('_', ' ')}
4. Reason:                 {reason}
5. Duration:               From {start_date} to {end_date} ({academic_days} Instructional Working Days)
6. Total Contact Periods:  {total_periods} Periods

Courses Impacted:
{subj_list_str}

I undertake that I will complete all lecture notes and laboratory assignments missed during this period. I request you to kindly approve the On-Duty attendance credit for the above scheduled periods.

Thanking you,

Yours sincerely,


Student Name: _______________________      Roll / Reg No: ____________________
Signature:    _______________________      Date:          ____________________

--------------------------------------------------------------------------------
FOR DEPARTMENTAL / OFFICE USE ONLY:
Verification Status: [  ] Approved    [  ] Rejected
Faculty Advisor Signature: __________________   HOD Signature: __________________
================================================================================
"""

od_service = ODService()
