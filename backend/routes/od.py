from fastapi import APIRouter, HTTPException
from backend.models.schemas import ODSimulateRequest
from backend.services.od_service import od_service

router = APIRouter(prefix="/api/od", tags=["On-Duty & Medical Leave Simulator"])

@router.post("/simulate")
def simulate_od(req: ODSimulateRequest):
    """
    Simulates On-Duty (OD) or Medical Leave (ML) application against real timetable schedule.
    Determines impacted periods, updates attendance scores, and returns full impact analysis and draft letter.
    """
    try:
        result = od_service.simulate_leave(
            section_id=req.sectionId,
            leave_type=req.leaveType,
            start_date=req.startDate,
            end_date=req.endDate,
            reason=req.reason or "Academic Event",
            policy=req.policy or "CONVERT_TO_ATTENDED",
            target_subject_codes=req.targetSubjectCodes,
            subject_stats=req.subjectStats,
            reference_today=req.referenceToday
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OD simulation error: {str(e)}")
