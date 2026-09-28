from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["Multi-Subject Section Dashboard"])

@router.get("/{section_id}")
def get_section_dashboard(
    section_id: str,
    todayDate: Optional[str] = Query(None, description="Current simulated reference date")
):
    """
    Returns multi-subject attendance health overview, bar charts, and distribution metrics
    for all courses in the specified section.
    """
    try:
        data = dashboard_service.get_section_dashboard(section_id=section_id, today_date=todayDate)
        return data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")
