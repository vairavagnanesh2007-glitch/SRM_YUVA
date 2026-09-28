from fastapi import APIRouter, HTTPException
from backend.models.schemas import SimulateRequest
from backend.services.attendance_service import attendance_service

router = APIRouter(prefix="/api/attendance", tags=["Simulation"])

@router.post("/simulate")
def simulate_attendance(req: SimulateRequest):
    """
    Real-time interactive What-If Simulator.
    Simulates attending N classes or missing N classes, returning updated standing and warnings.
    """
    try:
        res = attendance_service.simulate_what_if(
            classes_conducted=req.classesConducted,
            classes_attended=req.classesAttended,
            classes_remaining=req.classesRemaining,
            attend_next=req.attendNext,
            miss_next=req.missNext
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")
