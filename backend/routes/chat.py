from fastapi import APIRouter, HTTPException
from backend.models.schemas import ChatAdvisorRequest
from backend.services.advisor_service import advisor_service

router = APIRouter(prefix="/api/chat", tags=["AI Attendance Advisor"])

@router.post("/advisor")
def ask_advisor(req: ChatAdvisorRequest):
    """
    Intelligent Attendance Advisor Chatbot.
    Understands natural language questions regarding sick leaves, safe skips,
    detention boundaries, 75%/90% goals, and On-Duty requests.
    """
    try:
        response = advisor_service.answer_query(
            query=req.query,
            section_id=req.sectionId,
            current_subject_code=req.currentSubjectCode,
            classes_conducted=req.classesConducted,
            classes_attended=req.classesAttended,
            attendance_percentage=req.attendancePercentage,
            today_date=req.todayDate
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advisor processing error: {str(e)}")
