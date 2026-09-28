from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from backend.services.timetable_service import timetable_service

router = APIRouter(prefix="/api/sections", tags=["Sections"])

@router.get("", response_model=List[Dict[str, Any]])
def list_sections():
    """Returns list of all available sections from the official dataset."""
    return timetable_service.get_all_sections()

@router.get("/{section_id}")
def get_section_details(section_id: str):
    """Returns full details of a specific section."""
    sec = timetable_service.get_section(section_id)
    if not sec:
        raise HTTPException(status_code=404, detail=f"Section '{section_id}' not found.")
    return sec

@router.get("/{section_id}/subjects")
def get_section_subjects(section_id: str):
    """Returns all subjects and courses for a section."""
    subjects = timetable_service.get_section_subjects(section_id)
    if not subjects:
        raise HTTPException(status_code=404, detail=f"No subjects found for section '{section_id}'.")
    return subjects

@router.get("/{section_id}/timetable")
def get_section_timetable(section_id: str):
    """Returns complete timetable schedule and periods for a section."""
    sec = timetable_service.get_section(section_id)
    if not sec:
        raise HTTPException(status_code=404, detail=f"Section '{section_id}' not found.")
    return {
        "sectionId": sec["id"],
        "name": sec["name"],
        "batch": sec["batch"],
        "venue": sec["venue"],
        "timingType": sec.get("timingType"),
        "periods": sec.get("periods"),
        "subjects": sec.get("subjects")
    }

@router.get("/{section_id}/schedule")
def get_section_day_schedule(
    section_id: str,
    date: Optional[str] = None
):
    """Returns scheduled periods and subjects for the section on a specific date."""
    sec = timetable_service.get_section(section_id)
    if not sec:
        raise HTTPException(status_code=404, detail=f"Section '{section_id}' not found.")
    
    from datetime import datetime
    target_date_str = date or "2026-09-28"
    try:
        dt = datetime.strptime(target_date_str, "%Y-%m-%d").date()
        day_name = dt.strftime("%A")
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid date format '{target_date_str}'. Use YYYY-MM-DD.")

    classes = timetable_service.get_day_schedule(section_id, day_name)
    return {
        "sectionId": sec["id"],
        "name": sec["name"],
        "venue": sec["venue"],
        "date": target_date_str,
        "dayName": day_name,
        "classes": classes
    }
