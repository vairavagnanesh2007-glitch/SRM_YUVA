import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.room_locator_service import room_locator_service

client = TestClient(app)

class TestRoomLocatorRound2:
    def test_list_all_rooms(self):
        response = client.get("/api/rooms?day=Monday&currentTime=13:30")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 12
        # Verify essential fields
        first_room = data[0]
        assert "id" in first_room
        assert "name" in first_room
        assert "floor" in first_room
        assert "status" in first_room
        assert "freeUntil" in first_room
        assert "squadMessage" in first_room
        assert first_room["status"] in ["FREE", "OCCUPIED", "ENDING_SOON"]

    def test_floor_filtering(self):
        # Filter for 2nd floor
        response = client.get("/api/rooms?day=Monday&currentTime=10:00&floor=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3
        for room in data:
            assert room["floor"] == 2

    def test_list_floors(self):
        response = client.get("/api/rooms/floors")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5
        floor_nums = [f["floor"] for f in data]
        assert 1 in floor_nums  # Ground floor
        assert 5 in floor_nums  # 5th floor

    def test_room_schedule(self):
        response = client.get("/api/rooms/IST-518/schedule")
        assert response.status_code == 200
        data = response.json()
        assert "room" in data
        assert "weeklySchedule" in data
        assert data["room"]["id"] == "IST-518"

    def test_ai_smart_search_problem_statement_query(self):
        # Query directly from the official problem statement image
        query = "I need an AC room on the ground floor for me and my team for the next 2 hours."
        response = client.post("/api/rooms/ai-search", json={
            "query": query,
            "day": "Monday",
            "currentTime": "10:00"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["parsedParams"]["targetFloor"] == 1
        assert data["parsedParams"]["durationHours"] == 2.0
        assert data["parsedParams"]["requiresAC"] is True
        assert data["parsedParams"]["isTeamGroup"] is True
        assert len(data["topMatches"]) > 0
        top = data["topMatches"][0]
        assert top["floor"] == 1
        assert top["hasAC"] is True

    def test_call_the_squad_whatsapp_format(self):
        rooms = room_locator_service.get_all_rooms_status(day="Monday", current_time_str="13:30")
        free_rooms = [r for r in rooms if r["status"] == "FREE"]
        assert len(free_rooms) > 0
        target = free_rooms[0]
        # Must match problem statement format: "Heading to [Room]. It's free until [Time]. Come fast!"
        assert "Heading to" in target["squadMessage"]
        assert "It's free until" in target["squadMessage"]
        assert "Come fast!" in target["squadMessage"]
