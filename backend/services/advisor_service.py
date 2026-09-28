import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from backend.services.timetable_service import timetable_service
from backend.services.date_engine import date_engine
from backend.calculation.attendance_engine import attendance_engine
from backend.services.od_service import od_service

class AdvisorService:
    """
    Intelligent Attendance Advisor Engine.
    Processes natural language queries regarding leaves, bunk allowances,
    detention boundaries, 75%/90% goals, and On-Duty exemptions using
    the authoritative timetable dataset and deterministic math.
    """

    def __init__(self):
        self.timetable_svc = timetable_service
        self.date_eng = date_engine
        self.engine = attendance_engine
        self.od_svc = od_service

    def answer_query(
        self,
        query: str,
        section_id: str,
        current_subject_code: Optional[str] = None,
        classes_conducted: Optional[int] = None,
        classes_attended: Optional[int] = None,
        attendance_percentage: Optional[float] = None,
        today_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Main query responder. Parses natural language intent, checks timetable,
        runs mathematical calculations, and formats comprehensive guidance.
        """
        ref_today = today_date or "2026-09-28"
        today_dt = self.date_eng.parse_date(ref_today)
        section = self.timetable_svc.get_section(section_id)
        if not section:
            return {
                "answer": f"I couldn't find section '{section_id}'. Please select a valid class section.",
                "type": "ERROR",
                "suggestions": ["Select Section III ECE B", "Show timetable"]
            }

        q_lower = query.lower().strip()
        all_subjects = self.timetable_svc.get_section_subjects(section_id)

        # 1. Resolve Target Subject
        target_subject = self._resolve_subject(q_lower, all_subjects, current_subject_code)
        target_code = target_subject["code"] if target_subject else (current_subject_code or all_subjects[0]["code"])
        target_name = target_subject["name"] if target_subject else target_code

        # 2. Resolve Student Baseline Numbers
        counts = self.date_eng.get_timetable_counts(section_id, target_code, ref_today)
        C_sched = counts["conductedCount"]
        R_sched = counts["remainingCount"]

        if classes_conducted is not None and classes_attended is not None:
            C = int(classes_conducted)
            A = int(classes_attended)
        elif attendance_percentage is not None:
            pct = float(attendance_percentage)
            C = C_sched if C_sched > 0 else 25
            A = int(round((pct * C) / 100.0))
        else:
            C = C_sched if C_sched > 0 else 25
            A = int(round(0.68 * C))

        R = R_sched
        baseline_calc = self.engine.calculate_attendance_metrics(C, A, R)

        # 3. Detect Intent & Generate Personalized Response
        
        # --- INTENT A: Leave / Sick Leave Simulation ("If I take a 3-day sick leave starting tomorrow...") ---
        leave_match = re.search(r'(\d+)[ -]?(?:day|days)?\s*(?:sick\s*)?(?:leave|off|vacation)', q_lower)
        is_sick_leave = bool(leave_match or "sick leave" in q_lower or "take leave" in q_lower or "take off" in q_lower)

        if is_sick_leave:
            num_days = int(leave_match.group(1)) if leave_match else 3
            if "tomorrow" in q_lower:
                start_dt = today_dt + timedelta(days=1)
            else:
                start_dt = today_dt

            end_dt = start_dt + timedelta(days=num_days - 1)
            return self._handle_leave_simulation(
                section_id=section_id,
                target_code=target_code,
                target_name=target_name,
                start_dt=start_dt,
                end_dt=end_dt,
                num_days=num_days,
                C=C, A=A, R=R,
                baseline_calc=baseline_calc
            )

        # --- INTENT B: Safe Miss Inquiry ("How many classes can I safely miss?") ---
        if "safely" in q_lower or "safe" in q_lower or "how many can i miss" in q_lower or "buffer" in q_lower:
            return self._handle_safe_miss_inquiry(target_name, baseline_calc, R)

        # --- INTENT C: Skip / Bunk Next Class ("Can I skip tomorrow?", "Can I bunk 2 classes?") ---
        bunk_match = re.search(r'(?:bunk|skip|miss)\s*(\d+)?\s*(?:class|classes|lecture|lectures)?', q_lower)
        if "skip" in q_lower or "bunk" in q_lower or "miss" in q_lower:
            skip_count = int(bunk_match.group(1)) if (bunk_match and bunk_match.group(1)) else 1
            if "tomorrow" in q_lower:
                tomorrow_dt = today_dt + timedelta(days=1)
                tomorrow_day = tomorrow_dt.strftime("%A")
                day_sched = self.timetable_svc.get_day_schedule(section_id, tomorrow_day)
                tomorrow_periods = [p for p in day_sched if p["subjectCode"] == target_code]
                skip_count = max(1, len(tomorrow_periods))

            return self._handle_skip_simulation(
                target_name=target_name,
                skip_count=skip_count,
                C=C, A=A, R=R,
                baseline_calc=baseline_calc
            )

        # --- INTENT D: 75% or 90% Target Inquiry ("How many classes to reach 75% / 90%?") ---
        if "reach 90" in q_lower or "get 90" in q_lower or "90%" in q_lower:
            return self._handle_target_inquiry(target_name, baseline_calc, target_pct=90)

        if "reach 75" in q_lower or "get 75" in q_lower or "75%" in q_lower or "avoid detention" in q_lower:
            return self._handle_target_inquiry(target_name, baseline_calc, target_pct=75)

        # --- INTENT E: On-Duty (OD) Inquiry ("How does OD help?", "Will OD save me?") ---
        if "od" in q_lower or "on-duty" in q_lower or "on duty" in q_lower or "medical" in q_lower:
            return self._handle_od_inquiry(section_id, target_code, target_name, C, A, R, baseline_calc, today_dt)

        # --- INTENT F: General Overview / Health Check ---
        return self._handle_general_overview(target_name, baseline_calc, C, A, R)

    def _resolve_subject(self, q_lower: str, all_subjects: List[Dict[str, Any]], current_code: Optional[str]) -> Optional[Dict[str, Any]]:
        """Finds matching subject by keyword in query, or falls back to current code."""
        # 1. Direct code match
        for s in all_subjects:
            if s["code"].lower() in q_lower:
                return s

        # 2. Keyword name matching
        subject_keywords = {
            "math": "Mathematics",
            "discrete": "Discrete Mathematics",
            "microprocessor": "Microprocessor",
            "vlsi": "VLSI",
            "antenna": "Antenna",
            "microwave": "Microwave",
            "biomedical": "Biomedical",
            "circuit": "Circuit",
            "network": "Network",
            "python": "Python",
            "chemistry": "Chemistry",
            "physics": "Physics",
            "signal": "Signal"
        }

        for kw, full in subject_keywords.items():
            if kw in q_lower:
                for s in all_subjects:
                    if kw in s["name"].lower() or full.lower() in s["name"].lower():
                        return s

        # 3. Fallback to current subject
        if current_code:
            for s in all_subjects:
                if s["code"] == current_code:
                    return s

        return None

    def _handle_leave_simulation(
        self,
        section_id: str,
        target_code: str,
        target_name: str,
        start_dt: datetime,
        end_dt: datetime,
        num_days: int,
        C: int, A: int, R: int,
        baseline_calc: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculates exact consequence of a sick leave or multi-day leave."""
        # Query timetable for classes occurring in this leave window
        periods_missed = []
        curr = start_dt
        while curr <= end_dt:
            day_name = curr.strftime("%A")
            day_sched = self.timetable_svc.get_day_schedule(section_id, day_name)
            for p in day_sched:
                if p["subjectCode"] == target_code:
                    periods_missed.append({
                        "date": curr.strftime("%a, %d %b"),
                        "period": p["period"],
                        "time": p.get("time", "Scheduled Time")
                    })
            curr += timedelta(days=1)

        miss_count = len(periods_missed)
        # If no classes scheduled on those days, student is 100% fine!
        if miss_count == 0:
            return {
                "answer": (
                    f"🎉 **Great news!** You have **0 scheduled classes** of **{target_name}** "
                    f"during your proposed {num_days}-day leave ({start_dt.strftime('%b %d')} to {end_dt.strftime('%b %d')}).\n\n"
                    f"Your attendance remains safely unchanged at **{baseline_calc['currentAttendance']}%**."
                ),
                "type": "SAFE_LEAVE",
                "metrics": {
                    "classesMissed": 0,
                    "projectedAttendance": baseline_calc["currentAttendance"],
                    "safeMissesRemaining": baseline_calc["target75"]["safeToMiss"]
                },
                "suggestions": ["Check other subjects on these dates", "Open OD Simulator", "View calendar"]
            }

        # Calculate projected numbers if missed
        C_new = C + miss_count
        A_new = A  # Attended stays same
        R_new = max(0, R - miss_count)

        proj_calc = self.engine.calculate_attendance_metrics(C_new, A_new, R_new)
        proj_att = proj_calc["currentAttendance"]
        delta = round(proj_att - baseline_calc["currentAttendance"], 1)
        will_drop_below_75 = proj_att < 75.0
        is_detained = proj_calc["status"] == "IRREVERSIBLE_DETENTION"

        # Build periods list text
        periods_text = ", ".join(f"{p['date']} (P{p['period']})" for p in periods_missed[:4])

        if is_detained:
            ans = (
                f"🚨 **CRITICAL WARNING — IRREVERSIBLE DETENTION!**\n\n"
                f"If you take this {num_days}-day leave, you will miss **{miss_count} class(es)** of **{target_name}** ({periods_text}).\n\n"
                f"• Your attendance will crash to **{proj_att}%** ({delta}%).\n"
                f"• **Mathematical Reality:** Even attending 100% of all subsequent classes, you will finish at **{proj_calc['maximumPossibleAttendance']}%**, which is strictly below 75%!\n\n"
                f"💡 **Action Required:** Do NOT take unapproved leave. Immediately submit an **On-Duty (OD)** or medical certificate to recover attendance credit."
            )
            card_type = "DETENTION_WARNING"
        elif will_drop_below_75:
            ans = (
                f"⚠️ **YES, YOUR ATTENDANCE WILL DROP BELOW 75%!**\n\n"
                f"Taking a {num_days}-day leave starting {start_dt.strftime('%A, %b %d')} means you will miss **{miss_count} lecture(s)** of **{target_name}** ({periods_text}).\n\n"
                f"• **Current Attendance:** {baseline_calc['currentAttendance']}%\n"
                f"• **Projected Attendance:** **{proj_att}%** ({delta}% drop into Danger Zone)\n"
                f"• **Safe Misses Remaining:** {proj_calc['target75']['safeToMiss']} classes\n"
                f"• **Required Recovery:** You will need to attend **{proj_calc['target75']['requiredToAttend']} of the next {R_new} classes** to get back above 75%.\n\n"
                f"💡 **Advisor Tip:** If you must take leave, apply for an **On-Duty (OD)** pass in the OD Simulator to protect your standing."
            )
            card_type = "DANGER_WARNING"
        else:
            ans = (
                f"✅ **You can safely take this leave without falling below 75%.**\n\n"
                f"You will miss **{miss_count} class(es)** of **{target_name}** ({periods_text}).\n\n"
                f"• **Current Attendance:** {baseline_calc['currentAttendance']}%\n"
                f"• **Projected Attendance:** **{proj_att}%** (still above the 75% cutoff)\n"
                f"• **Safe Skips Remaining:** You will still have **{proj_calc['target75']['safeToMiss']} safe misses** remaining for the rest of the semester."
            )
            card_type = "SAFE"

        return {
            "answer": ans,
            "type": card_type,
            "metrics": {
                "classesMissed": miss_count,
                "currentAttendance": baseline_calc["currentAttendance"],
                "projectedAttendance": proj_att,
                "attendanceDelta": delta,
                "safeMissesRemaining": proj_calc["target75"]["safeToMiss"],
                "requiredFor75": proj_calc["target75"]["requiredToAttend"],
                "isDetentionRisk": will_drop_below_75
            },
            "periodsMissed": periods_missed,
            "suggestions": [
                f"Apply OD for {miss_count} classes",
                "What if I only miss 1 day?",
                "How many safe skips do I have left?"
            ]
        }

    def _handle_skip_simulation(self, target_name: str, skip_count: int, C: int, A: int, R: int, baseline_calc: Dict[str, Any]) -> Dict[str, Any]:
        """Handles single or multi-class skip inquiries."""
        safe_miss = baseline_calc["target75"]["safeToMiss"]
        can_safely_skip = skip_count <= safe_miss

        C_new = C + skip_count
        A_new = A
        R_new = max(0, R - skip_count)
        proj_calc = self.engine.calculate_attendance_metrics(C_new, A_new, R_new)

        if can_safely_skip:
            ans = (
                f"🟢 **Yes, you can safely skip {skip_count} class(es) of {target_name}.**\n\n"
                f"• **Current:** {baseline_calc['currentAttendance']}%\n"
                f"• **Projected:** **{proj_calc['currentAttendance']}%**\n"
                f"• **Remaining Safe Skips:** You have {safe_miss} safe misses, so you will have **{safe_miss - skip_count} safe skips** left after this."
            )
            card_type = "SAFE"
        else:
            ans = (
                f"🔴 **NO — Do NOT skip {skip_count} class(es)!**\n\n"
                f"You only have **{safe_miss} safe miss(es)** available before entering the detention zone.\n\n"
                f"• Skipping {skip_count} classes drops your attendance to **{proj_calc['currentAttendance']}%** (< 75%).\n"
                f"• You would then be forced to attend **{proj_calc['target75']['requiredToAttend']} consecutive classes** to recover!"
            )
            card_type = "DANGER_WARNING"

        return {
            "answer": ans,
            "type": card_type,
            "metrics": {
                "safeMissAllowance": safe_miss,
                "projectedAttendance": proj_calc["currentAttendance"]
            },
            "suggestions": [
                "How many classes can I safely miss?",
                "What if I attend the next 3 classes?",
                "Open OD Simulator"
            ]
        }

    def _handle_safe_miss_inquiry(self, target_name: str, baseline_calc: Dict[str, Any], R: int) -> Dict[str, Any]:
        safe_miss = baseline_calc["target75"]["safeToMiss"]
        need_75 = baseline_calc["target75"]["requiredToAttend"]

        ans = (
            f"🛡️ **Safe Miss Budget for {target_name}:**\n\n"
            f"You can safely miss **{safe_miss} class(es)** out of {R} remaining without dropping below 75%.\n\n"
            f"• **Current Score:** {baseline_calc['currentAttendance']}%\n"
            f"• **Must Attend:** {need_75} classes to guarantee 75% semester clearance.\n"
            f"• **Status:** {baseline_calc['statusLabel']}"
        )
        return {
            "answer": ans,
            "type": "INFO",
            "metrics": {
                "safeMisses": safe_miss,
                "mustAttend": need_75
            },
            "suggestions": ["What happens if I miss 1 class?", "How to reach 90%?", "Simulate sick leave"]
        }

    def _handle_target_inquiry(self, target_name: str, baseline_calc: Dict[str, Any], target_pct: int) -> Dict[str, Any]:
        target_info = baseline_calc["target90"] if target_pct == 90 else baseline_calc["target75"]
        possible = target_info["possible"]
        required = target_info["requiredToAttend"]
        R = baseline_calc["classesRemaining"]

        if not possible:
            ans = (
                f"⚠️ **{target_pct}% Target is Mathematically Unreachable for {target_name}.**\n\n"
                f"Even if you attend 100% of all {R} remaining classes, your maximum possible attendance ceiling is **{baseline_calc['maximumPossibleAttendance']}%**.\n\n"
                f"🎯 **Recommended Focus:** Lock in the 75% threshold by attending {baseline_calc['target75']['requiredToAttend']} classes."
            )
            card_type = "TARGET_UNREACHABLE"
        else:
            ans = (
                f"🎯 **Pathway to {target_pct}% in {target_name}:**\n\n"
                f"You need to attend **{required} of the {R} remaining classes** to hit {target_pct}%.\n\n"
                f"• **Current Attendance:** {baseline_calc['currentAttendance']}%\n"
                f"• **Safe Skips Before Missing {target_pct}%:** {target_info['safeToMiss']} classes."
            )
            card_type = "TARGET_ACHIEVABLE"

        return {
            "answer": ans,
            "type": card_type,
            "metrics": {
                "targetPercentage": target_pct,
                "isAchievable": possible,
                "classesRequired": required
            },
            "suggestions": ["Can I reach 90%?", "How many safe skips for 75%?", "View mathematical proof"]
        }

    def _handle_od_inquiry(self, section_id: str, target_code: str, target_name: str, C: int, A: int, R: int, baseline_calc: Dict[str, Any], today_dt: datetime) -> Dict[str, Any]:
        ans = (
            f"📋 **On-Duty (OD) Strategy for {target_name}:**\n\n"
            f"SRM Institute SEEE allows approved On-Duty leave for hackathons, paper presentations, and sports.\n\n"
            f"• **How it works:** Missed periods are converted into 'Attended' status upon HOD approval.\n"
            f"• **Impact:** Each approved OD class adds directly to your attended count $A$, immediately boosting your percentage.\n"
            f"• **Try it now:** Use our interactive **OD Simulator** to pick specific dates and generate an official approval letter."
        )
        return {
            "answer": ans,
            "type": "OD_INFO",
            "suggestions": ["Open OD Simulator", "Simulate 2-day OD", "Can I skip Friday?"]
        }

    def _handle_general_overview(self, target_name: str, baseline_calc: Dict[str, Any], C: int, A: int, R: int) -> Dict[str, Any]:
        ans = (
            f"📊 **Attendance Health for {target_name}:**\n\n"
            f"• **Current Attendance:** **{baseline_calc['currentAttendance']}%** ({A}/{C} classes attended)\n"
            f"• **Remaining Classes:** {R} scheduled lectures\n"
            f"• **Safe Skips Remaining:** **{baseline_calc['target75']['safeToMiss']} classes**\n"
            f"• **Required for 75%:** Attend {baseline_calc['target75']['requiredToAttend']} more\n"
            f"• **Maximum Possible Ceiling:** {baseline_calc['maximumPossibleAttendance']}%\n"
            f"• **Overall Standing:** {baseline_calc['statusLabel']}"
        )
        return {
            "answer": ans,
            "type": "OVERVIEW",
            "suggestions": [
                "If I take a 3-day sick leave starting tomorrow, will I drop below 75%?",
                "How many classes can I safely miss?",
                "Simulate On-Duty leave"
            ]
        }

advisor_service = AdvisorService()
