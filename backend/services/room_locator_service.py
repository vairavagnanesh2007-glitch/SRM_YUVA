import re
from typing import Dict, Any, List, Optional
from datetime import datetime, time

# Canonical list of rooms in SRM SEEE (IST Building)
# Based on the official 10 class timetables and campus facility directory
CAMPUS_ROOMS = [
    # Floor 1 / Ground Floor
    {
        "id": "IST-101",
        "name": "IST 101",
        "building": "IST Building",
        "floor": 1,
        "floorLabel": "Ground Floor",
        "capacity": 45,
        "hasAC": True,
        "hasProjector": True,
        "hasWhiteboard": True,
        "quietRating": "High",
        "type": "Discussion Classroom"
    },
    {
        "id": "IST-102",
        "name": "IST 102",
        "building": "IST Building",
        "floor": 1,
        "floorLabel": "Ground Floor",
        "capacity": 30,
        "hasAC": True,
        "hasProjector": False,
        "hasWhiteboard": True,
        "quietRating": "Medium",
        "type": "Team Project Room"
    },
    {
        "id": "IST-105",
        "name": "IST 105",
        "building": "IST Building",
        "floor": 1,
        "floorLabel": "Ground Floor",
        "capacity": 60,
        "hasAC": True,
        "hasProjector": True,
        "hasWhiteboard": True,
        "quietRating": "High",
        "type": "AC Seminar Hall"
    },

    # Floor 2
    {
        "id": "IST-211",
        "name": "IST 211",
        "building": "IST Building",
        "floor": 2,
        "floorLabel": "2nd Floor",
        "capacity": 65,
        "hasAC": True,
        "hasProjector": True,
        "hasWhiteboard": True,
        "quietRating": "Medium",
        "type": "Lecture Hall",
        "primarySection": "III-BME"
    },
    {
        "id": "IST-225",
        "name": "IST 225",
        "building": "IST Building",
        "floor": 2,
        "floorLabel": "2nd Floor",
        "capacity": 60,
        "hasAC": False,
        "hasProjector": True,
        "hasWhiteboard": True,
        "quietRating": "High",
        "type": "Smart Classroom",
        "primarySection": "IV-ECE-A"
    },
    {
        "id": "IST-227",
        "name": "IST 227",
        "building": "IST Building",
        "floor": 2,
        "floorLabel": "2nd Floor",
        "capacity": 60,
        "hasAC": False,
        "hasProjector": True,
        "hasWhiteboard": True,
        "quietRating": "High",
        "type": "Smart Classroom",
        "primarySection": "IV-ECE-B"
    },

    # Floor 3
    {
        "id": "IST-301",
        "name": "IST 301",
        "building": "IST Building",
        "floor": 3,
        "floorLabel": "3rd Floor",
        "capacity": 40,
        "hasAC": True,
        "hasProjector": True,
        "hasWhiteboard": True,
        "quietRating": "High",
        "type": "Robotics & Embedded Lab"
    },
    {
        "id": "IST-305",
        "name": "IST 305",
        "building": "IST Building",
        "floor": 3,
        "floorLabel": "3rd Floor",
        "capacity": 35,
        "hasAC": False,
        "hasProjector": False,
        "hasWhiteboard": True,
        "quietRating": "High",
        "type": "Tutorial Room"
    },

    # Floor 4
    {
        "id": "IST-411",
        "name": "IST 411",
        "building": "IST Building",
        "floor": 4,
        "floorLabel": "4th Floor",
        "capacity": 65,
        "hasAC": True,
        "hasProjector": True,
        "hasWhiteboard": True,
        "quietRating": "Medium",
        "type": "Lecture Hall",
        "primarySection": "II-ECE-DS-B"
    },
    {
        "id": "IST-416",
        "name": "IST 416",
        "building": "IST Building",
        "floor": 4,
        "floorLabel": "4th Floor",
        "capacity": 65,
        "hasAC": True,
        "hasProjector": True,
        "hasWhiteboard": True,
        "quietRating": "Medium",
        "type": "Lecture Hall",
        "primarySection": "II-ECE-DS-A"
    },

    # Floor 5
    {
        "id": "IST-509",
        "name": "IST 509",
        "building": "IST Building",
        "floor": 5,
        "floorLabel": "5th Floor",
        "capacity": 50,
        "hasAC": True,
        "hasProjector": True,
        "hasWhiteboard": True,
        "quietRating": "High",
        "type": "Collaborative Study Hall"
    },
    {
        "id": "IST-518",
        "name": "IST 518",
        "building": "IST Building",
        "floor": 5,
        "floorLabel": "5th Floor",
        "capacity": 70,
        "hasAC": True,
        "hasProjector": True,
        "hasWhiteboard": True,
        "quietRating": "Low",
        "type": "Main Lecture Auditorium",
        "primarySection": "III-ECE-A / III-ECE-B"
    },
    {
        "id": "IST-519",
        "name": "IST 519",
        "building": "IST Building",
        "floor": 5,
        "floorLabel": "5th Floor",
        "capacity": 65,
        "hasAC": True,
        "hasProjector": True,
        "hasWhiteboard": True,
        "quietRating": "Medium",
        "type": "Lecture Hall",
        "primarySection": "III-ECE-DS"
    },

    # Floor 6
    {
        "id": "IST-602",
        "name": "IST 602",
        "building": "IST Building",
        "floor": 6,
        "floorLabel": "6th Floor",
        "capacity": 65,
        "hasAC": False,
        "hasProjector": True,
        "hasWhiteboard": True,
        "quietRating": "High",
        "type": "Lecture Hall",
        "primarySection": "II-BME / I-ECE-A"
    },

    # Floor 7
    {
        "id": "IST-710",
        "name": "IST 710",
        "building": "IST Building",
        "floor": 7,
        "floorLabel": "7th Floor",
        "capacity": 60,
        "hasAC": True,
        "hasProjector": True,
        "hasWhiteboard": True,
        "quietRating": "High",
        "type": "Faculty Conference Room",
        "primarySection": "I-ECE-A"
    }
]

PERIOD_TIMES = {
    1: {"start": "09:00", "end": "09:50", "startMins": 9 * 60, "endMins": 9 * 60 + 50},
    2: {"start": "09:50", "end": "10:40", "startMins": 9 * 60 + 50, "endMins": 10 * 60 + 40},
    3: {"start": "10:50", "end": "11:40", "startMins": 10 * 60 + 50, "endMins": 11 * 60 + 40},
    4: {"start": "11:40", "end": "12:30", "startMins": 11 * 60 + 40, "endMins": 12 * 60 + 30},
    5: {"start": "12:30", "end": "13:20", "startMins": 12 * 60 + 30, "endMins": 13 * 60 + 20, "isLunch": True},
    6: {"start": "13:20", "end": "14:10", "startMins": 13 * 60 + 20, "endMins": 14 * 60 + 10},
    7: {"start": "14:10", "end": "15:00", "startMins": 14 * 60 + 10, "endMins": 15 * 60},
    8: {"start": "15:10", "end": "16:00", "startMins": 15 * 60 + 10, "endMins": 16 * 60},
    9: {"start": "16:00", "end": "16:50", "startMins": 16 * 60, "endMins": 16 * 60 + 50},
}

class RoomLocatorService:
    def __init__(self):
        from backend.services.timetable_service import timetable_service
        self.timetable_service = timetable_service
        self._room_bookings = None
        self._build_room_bookings()

    def _build_room_bookings(self):
        """Precomputes room schedule bookings per day and period from all 10 timetables."""
        bookings = {}
        for room in CAMPUS_ROOMS:
            bookings[room["id"]] = {day: {} for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']}

        raw_data = self.timetable_service._data or {}
        for sec in raw_data.get("sections", []):
            venue = sec.get("venue", "")
            base_venue = venue.split("/")[0].strip() if venue else "IST 518"
            
            for sub in sec.get("subjects", []):
                for slot in sub.get("schedule", []):
                    day = slot.get("day")
                    periods = slot.get("periods", [])
                    slot_venue = slot.get("venue")
                    actual_venue_str = slot_venue.split("/")[0].strip() if slot_venue else base_venue
                    
                    # Normalize string to room ID (e.g. "IST 518" -> "IST-518")
                    room_id = actual_venue_str.replace(" ", "-")
                    if room_id in bookings and day in bookings[room_id]:
                        for p in periods:
                            bookings[room_id][day][p] = {
                                "section": sec["name"],
                                "sectionId": sec["id"],
                                "subjectCode": sub["code"],
                                "subjectName": sub["name"],
                                "faculty": sub.get("faculty", "Faculty TBA")
                            }

        # Extra realistic bookings for special rooms
        bookings["IST-509"]["Monday"][7] = {
            "section": "M.Tech AI Lab",
            "sectionId": "PG-AI",
            "subjectCode": "21AIC501",
            "subjectName": "Advanced Deep Learning",
            "faculty": "Dr. S. K. Gupta"
        }
        bookings["IST-509"]["Tuesday"][8] = {
            "section": "Project Review",
            "sectionId": "SEEE-PR",
            "subjectCode": "21ECE401P",
            "subjectName": "Capstone Project Review",
            "faculty": "Committee"
        }

        self._room_bookings = bookings

    def get_room_schedule(self, room_id: str) -> Dict[str, Any]:
        """Returns the full weekly schedule for a given room."""
        room = next((r for r in CAMPUS_ROOMS if r["id"] == room_id), None)
        if not room:
            return {"error": f"Room {room_id} not found"}
        
        schedule = self._room_bookings.get(room_id, {})
        return {
            "room": room,
            "weeklySchedule": schedule,
            "periodTimes": PERIOD_TIMES
        }

    def get_all_rooms_status(
        self,
        day: str = "Monday",
        current_time_str: str = "13:30",
        floor: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Calculates occupancy status, remaining free countdown, and current booking
        for all rooms at the specified day and time.
        """
        # Parse time string into minutes
        try:
            parts = current_time_str.split(":")
            h = int(parts[0])
            m = int(parts[1]) if len(parts) > 1 else 0
            cur_mins = h * 60 + m
        except Exception:
            cur_mins = 13 * 60 + 30  # Default 1:30 PM

        # Identify current period
        current_period = None
        for p, info in PERIOD_TIMES.items():
            if info["startMins"] <= cur_mins < info["endMins"]:
                current_period = p
                break
        
        # If outside 09:00 - 17:00, clamp or set nearest
        if current_period is None:
            if cur_mins < 9 * 60:
                current_period = 1
            elif cur_mins >= 17 * 60:
                current_period = 9
            else:
                current_period = 6

        results = []
        for room in CAMPUS_ROOMS:
            if floor is not None and room["floor"] != floor:
                continue

            day_bookings = self._room_bookings.get(room["id"], {}).get(day, {})
            current_booking = day_bookings.get(current_period)

            is_occupied = current_booking is not None
            
            # Find when the room is free until
            free_until_str = "17:00"
            free_until_mins = 17 * 60
            minutes_left = 0
            next_class_info = None

            if is_occupied:
                # Find when this continuous class block ends
                block_end_period = current_period
                while (block_end_period + 1) in day_bookings:
                    block_end_period += 1
                end_info = PERIOD_TIMES.get(block_end_period, PERIOD_TIMES[9])
                free_after_str = end_info["end"]
                minutes_left = max(0, end_info["endMins"] - cur_mins)
                status = "OCCUPIED"
                status_color = "red"
            else:
                # Find the next period that has a class today
                next_period = None
                for p in range(current_period + 1, 10):
                    if p in day_bookings:
                        next_period = p
                        break
                
                if next_period:
                    next_info = PERIOD_TIMES[next_period]
                    free_until_str = next_info["start"]
                    free_until_mins = next_info["startMins"]
                    minutes_left = max(0, free_until_mins - cur_mins)
                    next_class_info = day_bookings[next_period]
                    if minutes_left <= 30:
                        status = "ENDING_SOON"
                        status_color = "amber"
                    else:
                        status = "FREE"
                        status_color = "green"
                else:
                    # Free for rest of the day
                    free_until_str = "17:00"
                    free_until_mins = 17 * 60
                    minutes_left = max(0, free_until_mins - cur_mins)
                    status = "FREE"
                    status_color = "green"

            # Format 12-hour display string (e.g. "2:30 PM")
            h_until = int(free_until_str.split(":")[0])
            m_until = free_until_str.split(":")[1]
            ampm = "PM" if h_until >= 12 else "AM"
            display_h = h_until if h_until <= 12 else h_until - 12
            display_free_until = f"{display_h}:{m_until} {ampm}"

            results.append({
                **room,
                "status": status,
                "statusColor": status_color,
                "currentPeriod": current_period,
                "currentBooking": current_booking,
                "nextClass": next_class_info,
                "freeUntil": display_free_until,
                "freeUntilRaw": free_until_str,
                "minutesLeft": minutes_left,
                "secondsLeft": minutes_left * 60,
                "countdownText": f"{minutes_left // 60}h {minutes_left % 60}m" if minutes_left >= 60 else f"{minutes_left}m",
                "squadMessage": f"📍 Heading to {room['name']}. It's free until {display_free_until}. Come fast!"
            })

        return results

    def ai_smart_room_search(
        self,
        query: str,
        day: str = "Monday",
        current_time_str: str = "13:30"
    ) -> Dict[str, Any]:
        """
        Processes natural language query like:
        'I need an AC room on the ground floor for me and my team for the next 2 hours.'
        Extracts intent, floor, duration, amenities, and returns ranked matching rooms.
        """
        q = query.lower()
        
        # 1. Floor detection
        target_floor = None
        if "ground" in q or "1st floor" in q or "floor 1" in q or "first floor" in q:
            target_floor = 1
        elif "2nd floor" in q or "floor 2" in q or "second floor" in q:
            target_floor = 2
        elif "3rd floor" in q or "floor 3" in q or "third floor" in q:
            target_floor = 3
        elif "4th floor" in q or "floor 4" in q or "fourth floor" in q:
            target_floor = 4
        elif "5th floor" in q or "floor 5" in q or "fifth floor" in q:
            target_floor = 5
        elif "6th floor" in q or "floor 6" in q or "sixth floor" in q:
            target_floor = 6
        elif "7th floor" in q or "floor 7" in q or "seventh floor" in q:
            target_floor = 7

        # 2. Duration detection
        duration_hours = 1.0
        dur_match = re.search(r'(\d+)\s*(?:hour|hr|hours|hrs)', q)
        if dur_match:
            duration_hours = float(dur_match.group(1))
        elif "half an hour" in q or "30 min" in q or "30 mins" in q:
            duration_hours = 0.5
        elif "two hours" in q or "couple of hours" in q:
            duration_hours = 2.0
        elif "three hours" in q:
            duration_hours = 3.0

        required_mins = int(duration_hours * 60)

        # 3. Amenities detection
        req_ac = "ac" in q or "air condition" in q or "cool" in q
        req_projector = "projector" in q or "presentation" in q or "slides" in q or "screen" in q
        req_team = "team" in q or "group" in q or "squad" in q or "friends" in q
        req_quiet = "quiet" in q or "silent" in q or "peaceful" in q or "study" in q or "focus" in q

        # Fetch all room statuses
        all_rooms = self.get_all_rooms_status(day=day, current_time_str=current_time_str)

        # Score and filter rooms
        ranked_rooms = []
        for r in all_rooms:
            # Check availability
            if r["status"] != "FREE" or r["minutesLeft"] < required_mins:
                continue

            score = 100
            reasons = []

            # Floor match
            if target_floor is not None:
                if r["floor"] == target_floor:
                    score += 50
                    reasons.append(f"Located exactly on {r['floorLabel']}")
                else:
                    score -= 40
            else:
                reasons.append(f"Located on {r['floorLabel']}")

            # AC match
            if req_ac:
                if r["hasAC"]:
                    score += 30
                    reasons.append("Air-conditioned (AC enabled)")
                else:
                    score -= 50

            # Projector match
            if req_projector:
                if r["hasProjector"]:
                    score += 25
                    reasons.append("Equipped with HD Projector")
                else:
                    score -= 30

            # Team size match
            if req_team:
                if r["capacity"] >= 40:
                    score += 20
                    reasons.append(f"Spacious seating for {r['capacity']} team members")
                else:
                    reasons.append(f"Capacity for {r['capacity']} members")

            # Quiet study match
            if req_quiet:
                if r["quietRating"] == "High":
                    score += 20
                    reasons.append("Designated high-focus quiet zone")

            reasons.append(f"Guaranteed free for {r['countdownText']} (until {r['freeUntil']})")

            ranked_rooms.append({
                **r,
                "matchScore": min(99, max(60, score)),
                "matchReason": " • ".join(reasons)
            })

        # Sort by matchScore desc, then minutesLeft desc
        ranked_rooms.sort(key=lambda x: (x["matchScore"], x["minutesLeft"]), reverse=True)

        return {
            "query": query,
            "parsedParams": {
                "targetFloor": target_floor,
                "durationHours": duration_hours,
                "requiredMinutes": required_mins,
                "requiresAC": req_ac,
                "requiresProjector": req_projector,
                "isTeamGroup": req_team,
                "requiresQuiet": req_quiet,
                "day": day,
                "referenceTime": current_time_str
            },
            "matchCount": len(ranked_rooms),
            "topMatches": ranked_rooms[:6]
        }

room_locator_service = RoomLocatorService()
