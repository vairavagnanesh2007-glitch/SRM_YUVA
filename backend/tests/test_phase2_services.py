import pytest
from backend.services.od_service import od_service
from backend.services.advisor_service import advisor_service
from backend.services.dashboard_service import dashboard_service

class TestPhase2Services:
    """Test suite verifying Phase 2 OD Simulator, AI Advisor, and Dashboard services."""

    def test_od_simulator_standard_leave(self):
        """Verify OD simulation properly identifies scheduled periods and boosts attendance."""
        res = od_service.simulate_leave(
            section_id="III-ECE-B",
            leave_type="ON_DUTY",
            start_date="2026-10-05",  # Monday
            end_date="2026-10-07",    # Wednesday (3 days)
            reason="National Overworld Hackathon",
            policy="CONVERT_TO_ATTENDED",
            reference_today="2026-09-28"
        )

        assert res["sectionId"] == "III-ECE-B"
        assert res["leaveType"] == "ON_DUTY"
        assert res["dateRange"]["academicDays"] == 3
        assert res["totalPeriodsApproved"] > 0
        assert len(res["subjectImpacts"]) > 0
        assert "SRM INSTITUTE OF SCIENCE AND TECHNOLOGY" in res["officialLetter"]

        # Check impact on Discrete Mathematics (21MAB302T)
        dm_impact = next((s for s in res["subjectImpacts"] if s["subjectCode"] == "21MAB302T"), None)
        assert dm_impact is not None
        assert dm_impact["odPeriodsCount"] >= 1
        assert dm_impact["postLeave"]["attendancePercentage"] >= dm_impact["baseline"]["attendancePercentage"]

    def test_od_simulator_medical_exemption_policy(self):
        """Verify Medical Leave exemption policy reduces conducted classes."""
        res = od_service.simulate_leave(
            section_id="III-ECE-B",
            leave_type="MEDICAL_LEAVE",
            start_date="2026-10-12",
            end_date="2026-10-14",
            reason="Hospitalization / Medical Rest",
            policy="EXEMPT_FROM_CONDUCTED",
            reference_today="2026-09-28"
        )
        assert res["policy"] == "EXEMPT_FROM_CONDUCTED"
        assert len(res["periodBreakdown"]) > 0

    def test_ai_advisor_sick_leave_query(self):
        """Verify the exact problem statement query: 3-day sick leave drop below 75%."""
        query = "If I take a 3-day sick leave starting tomorrow, will my Discrete Mathematics attendance drop below 75%?"
        res = advisor_service.answer_query(
            query=query,
            section_id="III-ECE-B",
            current_subject_code="21MAB302T",
            classes_conducted=25,
            classes_attended=17,  # 68% attendance
            today_date="2026-09-28"
        )

        assert "answer" in res
        assert "type" in res
        assert res["type"] in ["DANGER_WARNING", "DETENTION_WARNING", "SAFE", "SAFE_LEAVE"]
        assert "Discrete Mathematics" in res["answer"] or "21MAB302T" in res["answer"]
        assert len(res["suggestions"]) > 0

    def test_ai_advisor_safe_skip_query(self):
        """Verify AI advisor responds accurately to safe skip / bunk questions."""
        query = "How many classes can I safely miss in Discrete Mathematics?"
        res = advisor_service.answer_query(
            query=query,
            section_id="III-ECE-B",
            current_subject_code="21MAB302T",
            classes_conducted=25,
            classes_attended=17,
            today_date="2026-09-28"
        )
        assert "Safe Miss Budget" in res["answer"]
        assert res["metrics"]["safeMisses"] == 7

    def test_ai_advisor_target_90_query(self):
        """Verify AI advisor responds accurately to target 90% inquiries."""
        query = "Can I still achieve 90% attendance?"
        res = advisor_service.answer_query(
            query=query,
            section_id="III-ECE-B",
            current_subject_code="21MAB302T",
            classes_conducted=25,
            classes_attended=17,
            today_date="2026-09-28"
        )
        assert "90%" in res["answer"]
        assert "isAchievable" in res["metrics"]

    def test_multi_subject_dashboard(self):
        """Verify dashboard service aggregates all subjects in section."""
        dash = dashboard_service.get_section_dashboard(
            section_id="III-ECE-B",
            today_date="2026-09-28"
        )
        assert dash["sectionId"] == "III-ECE-B"
        assert len(dash["subjects"]) > 0
        assert "charts" in dash
        assert len(dash["charts"]["barChart"]) == len(dash["subjects"])
        assert len(dash["charts"]["distribution"]) == 4
        assert dash["summary"]["overallAverage"] > 0
