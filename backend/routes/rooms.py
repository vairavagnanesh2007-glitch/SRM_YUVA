from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from backend.services.room_locator_service import room_locator_service, CAMPUS_ROOMS

router = APIRouter(prefix="/api/rooms", tags=["Free Class Locator (Round 2)"])

class AISearchRequest(BaseModel):
    query: str
    day: Optional[str] = "Monday"
    currentTime: Optional[str] = "13:30"

@router.get("", response_model=List[Dict[str, Any]])
def list_rooms_status(
    day: str = Query("Monday", description="Day of the week (Monday - Friday)"),
    currentTime: str = Query("13:30", description="24-hour time HH:MM (e.g. 13:30 for 1:30 PM)"),
    floor: Optional[int] = Query(None, description="Filter by floor number (1 to 7)")
):
    """
    Returns live room availability, occupied class, and countdown timers across all campus floors.
    """
    return room_locator_service.get_all_rooms_status(day=day, current_time_str=currentTime, floor=floor)

@router.get("/floors", response_model=List[Dict[str, Any]])
def list_floors():
    """
    Returns list of floors with summary counts.
    """
    floors_map = {}
    for r in CAMPUS_ROOMS:
        fl = r["floor"]
        if fl not in floors_map:
            floors_map[fl] = {
                "floor": fl,
                "label": r["floorLabel"],
                "rooms": []
            }
        floors_map[fl]["rooms"].append(r["name"])
    
    return [floors_map[k] for k in sorted(floors_map.keys())]

@router.get("/{room_id}/schedule")
def get_room_schedule(room_id: str):
    """
    Returns the complete weekly timetable schedule for a specific classroom.
    """
    res = room_locator_service.get_room_schedule(room_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.post("/ai-search")
def search_rooms_with_ai(payload: AISearchRequest):
    """
    The AI Room Finder: Processes natural language student queries like:
    'I need an AC room on the ground floor for me and my team for the next 2 hours.'
    """
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")
    
    return room_locator_service.ai_smart_room_search(
        query=payload.query,
        day=payload.day or "Monday",
        current_time_str=payload.currentTime or "13:30"
    )
