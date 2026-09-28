import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "timetables.json")

class TimetableService:
    def __init__(self, data_path: str = DATA_PATH):
        self.data_path = data_path
        self._data: Optional[Dict[str, Any]] = None
        self.load_data()

    def load_data(self) -> Dict[str, Any]:
        with open(self.data_path, "r", encoding="utf-8") as f:
            self._data = json.load(f)
        return self._data

    @property
    def metadata(self) -> Dict[str, Any]:
        return self._data.get("metadata", {})

    @property
    def semester_start(self) -> str:
        return self.metadata.get("semesterStart", "2026-08-29")

    @property
    def semester_end(self) -> str:
        return self.metadata.get("semesterEnd", "2026-11-29")

    def get_all_sections(self) -> List[Dict[str, Any]]:
        sections = []
        for sec in self._data.get("sections", []):
            sections.append({
                "id": sec["id"],
                "name": sec["name"],
                "batch": sec["batch"],
                "venue": sec["venue"],
                "timingType": sec.get("timingType", "FN"),
                "subjectCount": len(sec["subjects"])
            })
        return sections

    def get_section(self, section_id: str) -> Optional[Dict[str, Any]]:
        for sec in self._data.get("sections", []):
            if sec["id"].lower() == section_id.lower() or sec["name"].lower() == section_id.lower():
                return sec
        return None

    def get_section_subjects(self, section_id: str) -> List[Dict[str, Any]]:
        sec = self.get_section(section_id)
        if not sec:
            return []
        subjects = []
        for s in sec.get("subjects", []):
            total_periods_week = sum(len(sch.get("periods", [])) for sch in s.get("schedule", []))
            days = [sch["day"] for sch in s.get("schedule", [])]
            subjects.append({
                "code": s["code"],
                "name": s["name"],
                "slot": s.get("slot", ""),
                "credit": s.get("credit", ""),
                "faculty": s.get("faculty", ""),
                "designation": s.get("designation", ""),
                "totalPeriodsPerWeek": total_periods_week,
                "scheduleDays": days
            })
        return subjects

    def get_subject(self, section_id: str, subject_code: str) -> Optional[Dict[str, Any]]:
        sec = self.get_section(section_id)
        if not sec:
            return None
        for s in sec.get("subjects", []):
            if s["code"].lower() == subject_code.lower() or s["name"].lower() == subject_code.lower():
                return s
        return None

    def get_day_schedule(self, section_id: str, day_name: str) -> List[Dict[str, Any]]:
        sec = self.get_section(section_id)
        if not sec:
            return []
        periods_map = {p["period"]: p.get("time", "") for p in sec.get("periods", [])}
        day_classes = []
        for subj in sec.get("subjects", []):
            for sch in subj.get("schedule", []):
                if sch.get("day", "").lower() == day_name.lower():
                    for p in sch.get("periods", []):
                        day_classes.append({
                            "period": p,
                            "time": periods_map.get(p, f"Period {p}"),
                            "subjectCode": subj["code"],
                            "subjectName": subj["name"],
                            "slot": subj.get("slot", ""),
                            "faculty": subj.get("faculty", ""),
                            "venue": sec.get("venue", "")
                        })
        day_classes.sort(key=lambda x: x["period"])
        return day_classes

# Singleton instance
timetable_service = TimetableService()
