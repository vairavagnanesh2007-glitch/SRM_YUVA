from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
from backend.services.timetable_service import timetable_service

class DateEngine:
    def __init__(self):
        self.service = timetable_service

    def parse_date(self, date_str: str) -> date:
        if isinstance(date_str, date):
            return date_str
        return datetime.strptime(date_str, "%Y-%m-%d").date()

    def get_period_timing(self, section: Dict[str, Any], period_num: int) -> str:
        for p in section.get("periods", []):
            if p.get("period") == period_num:
                return p.get("time", "")
        return ""

    def get_scheduled_classes_in_range(
        self,
        section_id: str,
        subject_code: str,
        start_date_str: str,
        end_date_str: str
    ) -> List[Dict[str, Any]]:
        """
        Scans every single calendar date between start_date and end_date.
        Checks if the day is in the subject's schedule, and returns every scheduled period.
        """
        section = self.service.get_section(section_id)
        if not section:
            raise ValueError(f"Section '{section_id}' not found.")

        subject = self.service.get_subject(section_id, subject_code)
        if not subject:
            raise ValueError(f"Subject '{subject_code}' not found in section '{section_id}'.")

        start_dt = self.parse_date(start_date_str)
        end_dt = self.parse_date(end_date_str)

        if start_dt > end_dt:
            return []

        # Map day name to list of periods
        schedule_map = {}
        for sch in subject.get("schedule", []):
            day_name = sch.get("day")
            periods = sch.get("periods", [])
            schedule_map[day_name] = periods

        classes = []
        cur_dt = start_dt
        while cur_dt <= end_dt:
            day_name = cur_dt.strftime("%A")
            if day_name in schedule_map:
                periods = schedule_map[day_name]
                for p in periods:
                    classes.append({
                        "date": cur_dt.strftime("%Y-%m-%d"),
                        "day": day_name,
                        "formattedDate": cur_dt.strftime("%a, %d %b %Y"),
                        "period": p,
                        "time": self.get_period_timing(section, p),
                        "venue": section.get("venue", ""),
                        "subjectCode": subject.get("code"),
                        "subjectName": subject.get("name"),
                        "faculty": subject.get("faculty"),
                        "slot": subject.get("slot")
                    })
            cur_dt += timedelta(days=1)

        return classes

    def get_timetable_counts(
        self,
        section_id: str,
        subject_code: str,
        today_str: str,
        planning_date_str: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Computes classes conducted up to today, and classes remaining until planning date / semester end.
        """
        sem_start = self.service.semester_start
        sem_end = self.service.semester_end

        today_dt = self.parse_date(today_str)
        sem_start_dt = self.parse_date(sem_start)
        sem_end_dt = self.parse_date(sem_end)

        if today_dt < sem_start_dt:
            # If today is before semester start, 0 conducted, all remaining from start
            conducted_classes = []
            remaining_start_dt = sem_start_dt
        elif today_dt > sem_end_dt:
            # Semester already ended
            conducted_classes = self.get_scheduled_classes_in_range(
                section_id, subject_code, sem_start, sem_end
            )
            remaining_start_dt = sem_end_dt + timedelta(days=1)
        else:
            # Normal case: conducted is from start through today
            conducted_classes = self.get_scheduled_classes_in_range(
                section_id, subject_code, sem_start, today_str
            )
            remaining_start_dt = today_dt + timedelta(days=1)

        # Target end date for planning
        if planning_date_str:
            target_plan_dt = self.parse_date(planning_date_str)
            if target_plan_dt > sem_end_dt:
                target_plan_dt = sem_end_dt
            if target_plan_dt < today_dt:
                raise ValueError("Planning date cannot be earlier than today's date.")
        else:
            target_plan_dt = sem_end_dt

        if remaining_start_dt <= target_plan_dt:
            remaining_classes = self.get_scheduled_classes_in_range(
                section_id, subject_code,
                remaining_start_dt.strftime("%Y-%m-%d"),
                target_plan_dt.strftime("%Y-%m-%d")
            )
        else:
            remaining_classes = []

        # Also get remaining till full semester end if planning date is an intermediate date
        if target_plan_dt < sem_end_dt:
            full_remaining_classes = self.get_scheduled_classes_in_range(
                section_id, subject_code,
                remaining_start_dt.strftime("%Y-%m-%d"),
                sem_end
            )
        else:
            full_remaining_classes = remaining_classes

        return {
            "semesterStart": sem_start,
            "semesterEnd": sem_end,
            "todayDate": today_str,
            "planningDate": target_plan_dt.strftime("%Y-%m-%d"),
            "conductedCount": len(conducted_classes),
            "remainingCount": len(remaining_classes),
            "fullSemesterRemainingCount": len(full_remaining_classes),
            "conductedClasses": conducted_classes,
            "remainingClasses": remaining_classes,
            "fullRemainingClasses": full_remaining_classes
        }

    def generate_calendar_days(
        self,
        section_id: str,
        subject_code: str,
        today_str: str,
        planning_date_str: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Builds daily breakdown for interactive UI calendar.
        """
        sem_start = self.service.semester_start
        sem_end = self.service.semester_end

        all_classes = self.get_scheduled_classes_in_range(
            section_id, subject_code, sem_start, sem_end
        )

        class_by_date = {}
        for c in all_classes:
            d = c["date"]
            if d not in class_by_date:
                class_by_date[d] = []
            class_by_date[d].append(c)

        today_dt = self.parse_date(today_str)
        plan_dt = self.parse_date(planning_date_str) if planning_date_str else self.parse_date(sem_end)
        cur_dt = self.parse_date(sem_start)
        end_dt = self.parse_date(sem_end)

        calendar_days = []
        while cur_dt <= end_dt:
            d_str = cur_dt.strftime("%Y-%m-%d")
            weekday_idx = cur_dt.weekday() # 0=Mon, 6=Sun
            is_weekend = weekday_idx >= 5
            scheduled_items = class_by_date.get(d_str, [])
            
            if cur_dt < today_dt:
                state = "PAST"
            elif cur_dt == today_dt:
                state = "TODAY"
            else:
                state = "UPCOMING"

            is_within_plan = (cur_dt >= today_dt and cur_dt <= plan_dt)

            calendar_days.append({
                "date": d_str,
                "dayNumber": cur_dt.day,
                "dayName": cur_dt.strftime("%a"),
                "monthName": cur_dt.strftime("%b"),
                "isWeekend": is_weekend,
                "state": state,
                "isWithinPlanningWindow": is_within_plan,
                "hasClass": len(scheduled_items) > 0,
                "classCount": len(scheduled_items),
                "classes": scheduled_items
            })
            cur_dt += timedelta(days=1)

        return calendar_days

date_engine = DateEngine()
