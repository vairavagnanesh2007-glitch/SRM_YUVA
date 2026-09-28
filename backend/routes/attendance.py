from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.models.schemas import CalculateRequest, UpcomingClassesRequest, LeaveImpactRequest
from backend.services.attendance_service import attendance_service
from backend.services.date_engine import date_engine

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

@router.post("/calculate")
def calculate_attendance(req: CalculateRequest):
    """
    Main authoritative calculation endpoint for attendance prediction.
    Calculates current standing, 75% requirements, 90% targets, safe-to-miss classes,
    irreversible detention checks, upcoming classes, calendar matrix, and timeline.
    """
    try:
        result = attendance_service.calculate_attendance_plan(
            section_id=req.sectionId,
            subject_code=req.subjectCode,
            attendance_percentage=req.attendancePercentage,
            classes_conducted=req.classesConducted,
            classes_attended=req.classesAttended,
            today_date=req.todayDate,
            planning_date=req.planningDate
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal calculation error: {str(e)}")

@router.post("/plan")
def plan_attendance_until(req: CalculateRequest):
    """
    Dedicated endpoint for the Future Date Planner ("Plan My Attendance Until [date]").
    """
    if not req.planningDate:
        raise HTTPException(status_code=400, detail="Planning date must be specified for date planning.")
    try:
        return attendance_service.calculate_attendance_plan(
            section_id=req.sectionId,
            subject_code=req.subjectCode,
            attendance_percentage=req.attendancePercentage,
            classes_conducted=req.classesConducted,
            classes_attended=req.classesAttended,
            today_date=req.todayDate,
            planning_date=req.planningDate
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal planner error: {str(e)}")

@router.get("/upcoming")
def get_upcoming_classes(
    sectionId: str = Query(..., description="Section ID"),
    subjectCode: str = Query(..., description="Subject Code"),
    todayDate: Optional[str] = Query(None, description="Reference Today Date"),
    limit: int = Query(15, description="Max classes to return")
):
    """
    Returns the next scheduled classes for the selected subject.
    """
    try:
        today_str = attendance_service.resolve_today(todayDate)
        counts = date_engine.get_timetable_counts(
            section_id=sectionId,
            subject_code=subjectCode,
            today_str=today_str
        )
        return {
            "sectionId": sectionId,
            "subjectCode": subjectCode,
            "todayDate": today_str,
            "classes": counts["remainingClasses"][:limit]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calendar")
def get_calendar(
    sectionId: str = Query(..., description="Section ID"),
    subjectCode: str = Query(..., description="Subject Code"),
    todayDate: Optional[str] = Query(None, description="Reference Today Date"),
    planningDate: Optional[str] = Query(None, description="Target Planning Date")
):
    """
    Returns full semester day-by-day calendar with scheduled class flags.
    """
    try:
        today_str = attendance_service.resolve_today(todayDate)
        calendar = date_engine.generate_calendar_days(
            section_id=sectionId,
            subject_code=subjectCode,
            today_str=today_str,
            planning_date_str=planningDate
        )
        return {
            "sectionId": sectionId,
            "subjectCode": subjectCode,
            "todayDate": today_str,
            "calendar": calendar
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/leave-impact")
def calculate_leave_impact(req: LeaveImpactRequest):
    """
    Calculates the projected impact of a planned leave on all affected subjects
    without modifying real attendance records.
    """
    try:
        from backend.services.timetable_service import timetable_service
        from backend.services.date_engine import date_engine
        from backend.calculation.attendance_engine import calculate_attendance_metrics
        from datetime import datetime, timedelta

        sec = timetable_service.get_section(req.sectionId)
        if not sec:
            raise HTTPException(status_code=404, detail=f"Section '{req.sectionId}' not found.")

        start_dt = date_engine.parse_date(req.startDate)
        end_dt = date_engine.parse_date(req.endDate)
        if end_dt < start_dt:
            raise HTTPException(status_code=400, detail="Start date cannot be after end date.")

        sem_start = date_engine.parse_date(timetable_service.semester_start)
        sem_end = date_engine.parse_date(timetable_service.semester_end)

        if start_dt > sem_end or end_dt < sem_start:
            raise HTTPException(status_code=400, detail="Selected leave dates fall outside the semester calendar.")

        # Find affected classes
        affected_periods = []
        subject_counts = {}
        curr = max(start_dt, sem_start)
        eff_end = min(end_dt, sem_end)
        academic_days = 0

        while curr <= eff_end:
            day_name = curr.strftime("%A")
            day_sched = timetable_service.get_day_schedule(req.sectionId, day_name)
            if day_sched:
                academic_days += 1
                for item in day_sched:
                    code = item["subjectCode"]
                    affected_periods.append({
                        "date": curr.strftime("%Y-%m-%d"),
                        "day": day_name,
                        "period": item["period"],
                        "time": item.get("time", ""),
                        "subjectCode": code,
                        "subjectName": item["subjectName"],
                        "slot": item.get("slot", ""),
                        "venue": item.get("venue", sec.get("venue"))
                    })
                    subject_counts[code] = subject_counts.get(code, 0) + 1
            curr += timedelta(days=1)

        total_classes_missed = len(affected_periods)
        threshold = req.threshold or 75.0
        ref_today = req.referenceToday or "2026-09-28"

        subjects = timetable_service.get_section_subjects(req.sectionId)
        subject_impacts = []
        at_risk_count = 0

        for s in subjects:
            code = s["code"]
            classes_affected = subject_counts.get(code, 0)

            # Get baseline
            counts = date_engine.get_timetable_counts(req.sectionId, code, ref_today)
            C = counts["conductedCount"]
            R = counts["remainingCount"]

            custom = (req.subjectStats or {}).get(code, {})
            if custom and "classesConducted" in custom and "classesAttended" in custom:
                C = int(custom["classesConducted"])
                A = int(custom["classesAttended"])
            elif custom and "attendancePercentage" in custom:
                pct = float(custom["attendancePercentage"])
                A = int(round((pct * C) / 100.0))
            else:
                A = max(0, int(round(0.78 * C))) if C > 0 else 0

            base_calc = calculate_attendance_metrics(C, A, R)
            current_pct = base_calc["currentAttendance"]

            if classes_affected > 0:
                C_proj = C + classes_affected
                A_proj = A
                R_proj = max(0, R - classes_affected)
                proj_calc = calculate_attendance_metrics(C_proj, A_proj, R_proj)
                proj_pct = proj_calc["currentAttendance"]
                diff = round(proj_pct - current_pct, 1)

                if proj_pct < threshold or not proj_calc["target75"]["possible"]:
                    status = "CRITICAL"
                    status_label = "At Risk (< 75%)"
                    at_risk_count += 1
                elif proj_pct < threshold + 5.0:
                    status = "WARNING"
                    status_label = "Warning (Close to 75%)"
                else:
                    status = "SAFE"
                    status_label = "Safe (>= 80%)"

                recovery_needed = proj_calc["target75"]["requiredToAttend"]
            else:
                proj_pct = current_pct
                diff = 0.0
                status = base_calc["status"]
                status_label = base_calc["statusLabel"]
                recovery_needed = base_calc["target75"]["requiredToAttend"]

            subject_impacts.append({
                "subjectCode": code,
                "subjectName": s["name"],
                "slot": s.get("slot"),
                "faculty": s.get("faculty"),
                "classesAffected": classes_affected,
                "currentAttendance": current_pct,
                "projectedAttendance": proj_pct,
                "difference": diff,
                "classesRequiredToRecover": recovery_needed,
                "status": status,
                "statusLabel": status_label,
                "remainsAboveThreshold": proj_pct >= threshold
            })

        affected_only = [s for s in subject_impacts if s["classesAffected"] > 0]
        total_days = (end_dt - start_dt).days + 1

        return {
            "sectionId": req.sectionId,
            "startDate": req.startDate,
            "endDate": req.endDate,
            "totalDays": total_days,
            "academicDays": academic_days,
            "reason": req.reason,
            "totalClassesPotentiallyMissed": total_classes_missed,
            "atRiskSubjectCount": at_risk_count,
            "affectedSubjects": affected_only,
            "allSubjects": subject_impacts,
            "periodBreakdown": affected_periods
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
