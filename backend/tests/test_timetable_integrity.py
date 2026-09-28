import unittest
from backend.services.timetable_service import timetable_service
from backend.services.date_engine import date_engine

class TestTimetableIntegrity(unittest.TestCase):
    
    def test_all_sections_present(self):
        sections = timetable_service.get_all_sections()
        self.assertGreaterEqual(len(sections), 10, "Should have at least 10 sections")
        sec_names = [s["name"] for s in sections]
        expected_sections = [
            "III ECE B", "III ECE A", "III ECE DS", "III BME", "II BME",
            "II ECE DS A", "II ECE DS B", "IV ECE A", "IV ECE B", "I ECE A"
        ]
        for exp in expected_sections:
            self.assertIn(exp, sec_names, f"Expected section '{exp}' to be in dataset")

    def test_all_sections_have_subjects_and_periods(self):
        sections = timetable_service.get_all_sections()
        valid_weekdays = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"}
        for s in sections:
            sec_id = s["id"]
            subjects = timetable_service.get_section_subjects(sec_id)
            self.assertGreater(len(subjects), 0, f"Section {sec_id} has no subjects")
            for subj in subjects:
                full_subj = timetable_service.get_subject(sec_id, subj["code"])
                self.assertIsNotNone(full_subj)
                self.assertTrue(len(full_subj.get("schedule", [])) > 0, f"Subject {subj['code']} in {sec_id} has empty schedule")
                for entry in full_subj["schedule"]:
                    self.assertIn(entry["day"], valid_weekdays)
                    self.assertTrue(len(entry["periods"]) > 0)
                    for p in entry["periods"]:
                        self.assertIn(p, range(1, 10), f"Period {p} out of range 1-9")

    def test_class_occurrence_counting(self):
        # Test Discrete Mathematics in III ECE B
        # Monday (p8), Wednesday (p8), Thursday (p6), Friday (p7) = 4 periods/week
        counts = date_engine.get_timetable_counts(
            section_id="III-ECE-B",
            subject_code="21MAB302T",
            today_str="2026-09-28"
        )
        self.assertGreater(counts["conductedCount"], 0)
        self.assertGreater(counts["remainingCount"], 0)
        total_occurrences = counts["conductedCount"] + counts["remainingCount"]
        self.assertGreaterEqual(total_occurrences, 40, "Semester should have around 45-55 classes for a 4/wk subject")

    def test_future_planning_date(self):
        counts = date_engine.get_timetable_counts(
            section_id="III-ECE-B",
            subject_code="21MAB302T",
            today_str="2026-09-28",
            planning_date_str="2026-10-15"
        )
        # Classes until Oct 15 should be strictly less than full semester remaining
        self.assertLess(counts["remainingCount"], counts["fullSemesterRemainingCount"])

    def test_calendar_generation(self):
        calendar = date_engine.generate_calendar_days(
            section_id="III-ECE-B",
            subject_code="21MAB302T",
            today_str="2026-09-28"
        )
        self.assertEqual(len(calendar), 93, "Total days between Aug 29 and Nov 29 should be 93 days")
        past_days = [d for d in calendar if d["state"] == "PAST"]
        today_days = [d for d in calendar if d["state"] == "TODAY"]
        future_days = [d for d in calendar if d["state"] == "UPCOMING"]
        self.assertEqual(len(today_days), 1)
        self.assertGreater(len(past_days), 0)
        self.assertGreater(len(future_days), 0)

if __name__ == "__main__":
    unittest.main()
