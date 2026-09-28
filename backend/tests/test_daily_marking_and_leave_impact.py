import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

class TestDailyMarkingAndLeaveImpact:
    """Test suite verifying Daily Attendance Schedule API and Leave Planner Impact calculations."""

    def test_get_section_schedule_valid_date(self):
        """Verify schedule endpoint returns real timetable periods for a weekday."""
        # 2026-09-28 is a Monday
        response = client.get("/api/sections/III-ECE-B/schedule?date=2026-09-28")
        assert response.status_code == 200
        data = response.json()
        
        assert data["sectionId"] == "III-ECE-B"
        assert data["date"] == "2026-09-28"
        assert data["dayName"] == "Monday"
        assert len(data["classes"]) > 0
        
        # Verify first class has expected fields
        first_class = data["classes"][0]
        assert "period" in first_class
        assert "time" in first_class
        assert "subjectCode" in first_class
        assert "subjectName" in first_class
        assert "faculty" in first_class

    def test_get_section_schedule_weekend(self):
        """Verify schedule endpoint handles Saturday/Sunday with zero periods."""
        # 2026-10-04 is a Sunday
        response = client.get("/api/sections/III-ECE-B/schedule?date=2026-10-04")
        assert response.status_code == 200
        data = response.json()
        assert data["dayName"] == "Sunday"
        assert len(data["classes"]) == 0

    def test_leave_impact_valid_request(self):
        """Verify leave impact calculates accurate timetable period losses and projected attendance."""
        payload = {
            "sectionId": "III-ECE-B",
            "startDate": "2026-10-05",  # Monday
            "endDate": "2026-10-07",    # Wednesday (3 days)
            "referenceToday": "2026-09-28"
        }
        response = client.post("/api/attendance/leave-impact", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["sectionId"] == "III-ECE-B"
        assert data["academicDays"] == 3
        assert data["totalClassesPotentiallyMissed"] > 0
        assert len(data["affectedSubjects"]) > 0
        assert len(data["periodBreakdown"]) == data["totalClassesPotentiallyMissed"]

        # Check impact structure
        first_impact = data["affectedSubjects"][0]
        assert "subjectCode" in first_impact
        assert "classesAffected" in first_impact
        assert first_impact["classesAffected"] > 0
        assert "currentAttendance" in first_impact
        assert "projectedAttendance" in first_impact
        assert first_impact["projectedAttendance"] <= first_impact["currentAttendance"]
        assert "status" in first_impact
        assert first_impact["status"] in ["SAFE", "WARNING", "CRITICAL"]

    def test_leave_impact_validation_errors(self):
        """Verify invalid date ranges are properly rejected with HTTP 400."""
        # Start date after end date
        payload = {
            "sectionId": "III-ECE-B",
            "startDate": "2026-10-15",
            "endDate": "2026-10-10",
            "referenceToday": "2026-09-28"
        }
        response = client.post("/api/attendance/leave-impact", json=payload)
        assert response.status_code == 400

        # Leave dates completely outside semester calendar (e.g., January 2026)
        payload_outside = {
            "sectionId": "III-ECE-B",
            "startDate": "2026-01-10",
            "endDate": "2026-01-15",
            "referenceToday": "2026-09-28"
        }
        response_outside = client.post("/api/attendance/leave-impact", json=payload_outside)
        assert response_outside.status_code == 400
