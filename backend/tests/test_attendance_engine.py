import unittest
import math
from backend.calculation.attendance_engine import calculate_attendance_metrics

class TestAttendanceEngine(unittest.TestCase):
    
    # 1. 100% Attendance
    def test_100_percent_attendance(self):
        res = calculate_attendance_metrics(classes_conducted=20, classes_attended=20, classes_remaining=20)
        self.assertEqual(res["currentAttendance"], 100.0)
        self.assertEqual(res["status"], "SAFE")
        self.assertEqual(res["target75"]["requiredToAttend"], 10) # 0.75 * 40 - 20 = 10
        self.assertEqual(res["target75"]["safeToMiss"], 10)
        self.assertEqual(res["target90"]["requiredToAttend"], 16) # 0.90 * 40 - 20 = 16
        self.assertEqual(res["target90"]["safeToMiss"], 4)

    # 2. 90% Attendance
    def test_90_percent_attendance(self):
        res = calculate_attendance_metrics(classes_conducted=30, classes_attended=27, classes_remaining=10)
        self.assertEqual(res["currentAttendance"], 90.0)
        self.assertEqual(res["status"], "SAFE")
        # total 40 classes. 75% is 30. A=27 -> req 3.
        self.assertEqual(res["target75"]["requiredToAttend"], 3)
        self.assertEqual(res["target75"]["safeToMiss"], 7)
        # 90% is 36. A=27 -> req 9.
        self.assertEqual(res["target90"]["requiredToAttend"], 9)
        self.assertEqual(res["target90"]["safeToMiss"], 1)

    # 3. Exactly 75% Attendance
    def test_exactly_75_percent(self):
        res = calculate_attendance_metrics(classes_conducted=40, classes_attended=30, classes_remaining=20)
        self.assertEqual(res["currentAttendance"], 75.0)
        self.assertEqual(res["status"], "WATCH")
        # total 60. 75% is 45. A=30 -> req 15
        self.assertEqual(res["target75"]["requiredToAttend"], 15)
        self.assertEqual(res["target75"]["safeToMiss"], 5)
        self.assertTrue(res["target75"]["possible"])

    # 4. 74.99% Attendance (Below 75%)
    def test_below_75_boundary(self):
        # 74 out of 100 = 74%
        res = calculate_attendance_metrics(classes_conducted=100, classes_attended=74, classes_remaining=20)
        self.assertEqual(res["currentAttendance"], 74.0)
        self.assertEqual(res["status"], "DANGER")
        # total 120. 75% of 120 is 90. A=74 -> req 16
        self.assertEqual(res["target75"]["requiredToAttend"], 16)
        self.assertEqual(res["target75"]["safeToMiss"], 4)

    # 5. Below 75% but recoverable
    def test_below_75_recoverable(self):
        # C=25, A=17 (68%), R=27. Total = 52.
        # 75% of 52 = 39. A=17 -> req = 22. R=27 >= 22 -> possible!
        res = calculate_attendance_metrics(classes_conducted=25, classes_attended=17, classes_remaining=27)
        self.assertEqual(res["currentAttendance"], 68.0)
        self.assertEqual(res["status"], "DANGER")
        self.assertTrue(res["target75"]["possible"])
        self.assertEqual(res["target75"]["requiredToAttend"], 22)
        self.assertEqual(res["target75"]["safeToMiss"], 5)
        self.assertEqual(res["maximumPossibleAttendance"], 84.62)

    # 6. Below 75% and IRREVERSIBLE DETENTION (impossible)
    def test_irreversible_detention(self):
        # C=40, A=10 (25%), R=10. Total = 50. Max possible = (10+10)/50 = 40% < 75%
        res = calculate_attendance_metrics(classes_conducted=40, classes_attended=10, classes_remaining=10)
        self.assertEqual(res["status"], "IRREVERSIBLE_DETENTION")
        self.assertFalse(res["target75"]["possible"])
        self.assertEqual(res["target75"]["safeToMiss"], 0)
        self.assertEqual(res["maximumPossibleAttendance"], 40.0)

    # 7. 0% Attendance
    def test_zero_percent_attendance(self):
        res = calculate_attendance_metrics(classes_conducted=10, classes_attended=0, classes_remaining=40)
        self.assertEqual(res["currentAttendance"], 0.0)
        self.assertEqual(res["status"], "DANGER")
        # Total 50. 75% of 50 = 37.5 -> 38. R=40 -> possible!
        self.assertEqual(res["target75"]["requiredToAttend"], 38)
        self.assertEqual(res["target75"]["safeToMiss"], 2)
        self.assertTrue(res["target75"]["possible"])

    # 8. One remaining class
    def test_one_remaining_class(self):
        # C=19, A=14. Current = 14/19 = 73.68%. R=1. Total=20. 75% of 20 = 15. Req = 1.
        res = calculate_attendance_metrics(classes_conducted=19, classes_attended=14, classes_remaining=1)
        self.assertTrue(res["target75"]["possible"])
        self.assertEqual(res["target75"]["requiredToAttend"], 1)
        self.assertEqual(res["target75"]["safeToMiss"], 0)

    # 9. No remaining classes
    def test_no_remaining_classes(self):
        # C=30, A=24 (80%), R=0.
        res = calculate_attendance_metrics(classes_conducted=30, classes_attended=24, classes_remaining=0)
        self.assertEqual(res["target75"]["requiredToAttend"], 0)
        self.assertEqual(res["target75"]["safeToMiss"], 0)
        self.assertTrue(res["target75"]["possible"])

    # 10. 75% already secured (even if 0 future classes attended)
    def test_75_already_secured(self):
        # C=50, A=45, R=10. Total 60. 75% is 45. A=45. Req = 0.
        res = calculate_attendance_metrics(classes_conducted=50, classes_attended=45, classes_remaining=10)
        self.assertEqual(res["target75"]["requiredToAttend"], 0)
        self.assertEqual(res["target75"]["safeToMiss"], 10)

    # 11. 90% already secured
    def test_90_already_secured(self):
        # C=50, A=48, R=2. Total 52. 90% of 52 = 46.8 -> 47. A=48. Req = 0.
        res = calculate_attendance_metrics(classes_conducted=50, classes_attended=48, classes_remaining=2)
        self.assertEqual(res["target90"]["requiredToAttend"], 0)
        self.assertEqual(res["target90"]["safeToMiss"], 2)

    # 12. 90% impossible but 75% possible
    def test_90_impossible_75_possible(self):
        # C=30, A=20, R=10. Total 40. Max = (20+10)/40 = 75%.
        # 90% needs 36 -> impossible. 75% needs 30 -> needs all 10.
        res = calculate_attendance_metrics(classes_conducted=30, classes_attended=20, classes_remaining=10)
        self.assertTrue(res["target75"]["possible"])
        self.assertFalse(res["target90"]["possible"])
        self.assertEqual(res["target90"]["requiredToAttend"], 16)
        self.assertEqual(res["target90"]["safeToMiss"], 0)
        self.assertEqual(res["target75"]["requiredToAttend"], 10)
        self.assertEqual(res["target75"]["safeToMiss"], 0)

if __name__ == "__main__":
    unittest.main()
