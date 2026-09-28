import math
from typing import Dict, Any, List

def calculate_attendance_metrics(
    classes_conducted: int,
    classes_attended: int,
    classes_remaining: int
) -> Dict[str, Any]:
    """
    Core authoritative calculation engine for student attendance analytics.
    Uses exact integer mathematics with ceiling clamps.
    
    C = classes_conducted
    A = classes_attended
    R = classes_remaining
    """
    C = max(0, int(classes_conducted))
    A = max(0, min(C, int(classes_attended)))
    R = max(0, int(classes_remaining))
    total_semester_classes = C + R

    # Current Attendance
    if C > 0:
        current_attendance = round((A / C) * 100, 2)
    else:
        current_attendance = 100.0 if A == 0 else 0.0

    # Maximum Possible Attendance (attend all R remaining classes)
    if total_semester_classes > 0:
        max_possible_attendance = round(((A + R) / total_semester_classes) * 100, 2)
        min_possible_attendance = round((A / total_semester_classes) * 100, 2)
    else:
        max_possible_attendance = current_attendance
        min_possible_attendance = current_attendance

    # Target 75%
    # (A + x) / (C + R) >= 0.75  =>  x >= 0.75*(C + R) - A
    # Epsilon prevents floating point precision artifacts (e.g. 39.0000000004 -> 40)
    raw_req_75 = math.ceil(0.75 * total_semester_classes - A - 1e-9)
    req_75 = max(0, raw_req_75)
    possible_75 = (req_75 <= R) and (max_possible_attendance >= 75.0 - 1e-9)
    
    if possible_75:
        safe_to_miss_75 = max(0, R - req_75)
        required_for_75 = min(R, req_75)
    else:
        safe_to_miss_75 = 0
        required_for_75 = req_75

    # Target 90%
    # (A + x) / (C + R) >= 0.90  =>  x >= 0.90*(C + R) - A
    raw_req_90 = math.ceil(0.90 * total_semester_classes - A - 1e-9)
    req_90 = max(0, raw_req_90)
    possible_90 = (req_90 <= R) and (max_possible_attendance >= 90.0 - 1e-9)

    if possible_90:
        safe_to_miss_90 = max(0, R - req_90)
        required_for_90 = min(R, req_90)
    else:
        safe_to_miss_90 = 0
        required_for_90 = req_90

    # Status Determination
    # SAFE: current >= 90%
    # WATCH: 75% <= current < 90%
    # DANGER: current < 75% AND recovery possible
    # IRREVERSIBLE_DETENTION: current < 75% AND max_possible < 75%
    if total_semester_classes > 0 and max_possible_attendance < 75.0 - 1e-9:
        status = "IRREVERSIBLE_DETENTION"
        status_label = "🚨 IRREVERSIBLE DETENTION"
        status_color = "red"
    elif current_attendance < 75.0:
        status = "DANGER"
        status_label = "⚠️ DANGER ZONE"
        status_color = "amber"
    elif current_attendance < 90.0:
        status = "WATCH"
        status_label = "👁️ WATCH ZONE"
        status_color = "yellow"
    else:
        status = "SAFE"
        status_label = "🛡️ SAFE ZONE"
        status_color = "green"

    # Explanations
    explanations: List[str] = []
    
    if status == "IRREVERSIBLE_DETENTION":
        shortfall = math.ceil(0.75 * total_semester_classes - (A + R) - 1e-9)
        explanations.append(
            f"Even if you attend every remaining class (all {R} classes), your final attendance will top out at {max_possible_attendance}%. The mandatory 75% threshold is mathematically unreachable by {shortfall} class(es)."
        )
    elif current_attendance < 75.0:
        explanations.append(
            f"You are currently at {current_attendance}% ({A}/{C} classes), which is below the mandatory 75% mark."
        )
        if possible_75:
            explanations.append(
                f"Recovery is mathematically achievable! You must attend at least {required_for_75} of the {R} remaining scheduled classes to finish at or above 75%."
            )
            if safe_to_miss_75 > 0:
                explanations.append(
                    f"You have a margin of {safe_to_miss_75} class(es) you can safely miss while still qualifying for 75%."
                )
            else:
                explanations.append(
                    f"Zero margin for error! You cannot afford to miss a single remaining class."
                )
    else:
        explanations.append(
            f"Your current attendance is {current_attendance}% ({A}/{C} classes), safely above the 75% detention threshold."
        )
        if safe_to_miss_75 > 0:
            explanations.append(
                f"You can safely miss up to {safe_to_miss_75} remaining class(es) and still finish the semester at or above 75%."
            )

    if not possible_90:
        explanations.append(
            f"90% Target Unreachable: Even with 100% attendance in all {R} remaining classes, your maximum final score will be {max_possible_attendance}%."
        )
    else:
        if current_attendance >= 90.0:
            explanations.append(
                f"To maintain >=90% attendance through semester end, you can miss at most {safe_to_miss_90} of the remaining {R} classes."
            )
        else:
            explanations.append(
                f"To reach 90% attendance by semester end, you must attend {required_for_90} of the remaining {R} classes (can safely miss {safe_to_miss_90})."
            )

    formula_proof = {
        "c_conducted": C,
        "a_attended": A,
        "r_remaining": R,
        "total_classes": total_semester_classes,
        "target_75_inequality": f"({A} + x) / ({C} + {R}) >= 0.75",
        "target_75_threshold_count": round(0.75 * total_semester_classes, 2),
        "target_75_required_raw": round(0.75 * total_semester_classes - A, 2),
        "target_75_required_ceil": req_75,
        "target_75_safe_miss": safe_to_miss_75,
        "target_90_inequality": f"({A} + x) / ({C} + {R}) >= 0.90",
        "target_90_threshold_count": round(0.90 * total_semester_classes, 2),
        "target_90_required_raw": round(0.90 * total_semester_classes - A, 2),
        "target_90_required_ceil": req_90,
        "target_90_safe_miss": safe_to_miss_90,
        "max_possible_calc": f"({A} + {R}) / ({total_semester_classes}) * 100 = {max_possible_attendance}%"
    }

    return {
        "classesConducted": C,
        "classesAttended": A,
        "classesAbsent": C - A,
        "classesRemaining": R,
        "totalSemesterClasses": total_semester_classes,
        "currentAttendance": current_attendance,
        "maximumPossibleAttendance": max_possible_attendance,
        "minimumPossibleAttendance": min_possible_attendance,
        "target75": {
            "requiredToAttend": required_for_75,
            "possible": possible_75,
            "safeToMiss": safe_to_miss_75,
            "thresholdClassesNeeded": math.ceil(0.75 * total_semester_classes - 1e-9)
        },
        "target90": {
            "requiredToAttend": required_for_90,
            "possible": possible_90,
            "safeToMiss": safe_to_miss_90,
            "thresholdClassesNeeded": math.ceil(0.90 * total_semester_classes - 1e-9)
        },
        "status": status,
        "statusLabel": status_label,
        "statusColor": status_color,
        "explanations": explanations,
        "formulaProof": formula_proof
    }

class AttendanceEngine:
    @staticmethod
    def calculate_attendance_metrics(*args, **kwargs):
        return calculate_attendance_metrics(*args, **kwargs)

# Export aliases for flexibility
attendance_engine = AttendanceEngine
