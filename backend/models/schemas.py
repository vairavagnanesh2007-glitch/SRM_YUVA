from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any

class CalculateRequest(BaseModel):
    sectionId: str = Field(..., description="ID or Name of the class section (e.g. 'III-ECE-B')")
    subjectCode: str = Field(..., description="Subject code (e.g. '21MAB302T')")
    attendancePercentage: Optional[float] = Field(None, ge=0.0, le=100.0, description="Mode 1: Current percentage (0-100)")
    classesConducted: Optional[int] = Field(None, ge=0, description="Mode 2: Total classes conducted so far")
    classesAttended: Optional[int] = Field(None, ge=0, description="Mode 2: Total classes attended so far")
    todayDate: Optional[str] = Field(None, description="Current simulated date in YYYY-MM-DD")
    planningDate: Optional[str] = Field(None, description="Target planning date in YYYY-MM-DD")

    @field_validator("classesAttended")
    @classmethod
    def check_attended_le_conducted(cls, v, info):
        conducted = info.data.get("classesConducted")
        if conducted is not None and v is not None and v > conducted:
            raise ValueError("classesAttended cannot exceed classesConducted")
        return v

class SimulateRequest(BaseModel):
    classesConducted: int = Field(..., ge=0, description="Conducted classes")
    classesAttended: int = Field(..., ge=0, description="Attended classes")
    classesRemaining: int = Field(..., ge=0, description="Remaining classes")
    attendNext: int = Field(0, ge=0, description="Future classes attended in simulation")
    missNext: int = Field(0, ge=0, description="Future classes missed in simulation")

    @field_validator("classesAttended")
    @classmethod
    def check_attended(cls, v, info):
        c = info.data.get("classesConducted")
        if c is not None and v > c:
            raise ValueError("classesAttended cannot exceed classesConducted")
        return v

class UpcomingClassesRequest(BaseModel):
    sectionId: str
    subjectCode: str
    todayDate: Optional[str] = None
    limit: Optional[int] = 15

class ODSimulateRequest(BaseModel):
    sectionId: str = Field(..., description="Section ID")
    leaveType: str = Field("ON_DUTY", description="'ON_DUTY' or 'MEDICAL_LEAVE'")
    startDate: str = Field(..., description="Start date YYYY-MM-DD")
    endDate: str = Field(..., description="End date YYYY-MM-DD")
    reason: Optional[str] = Field("Academic Symposium / Hackathon", description="Reason for leave")
    policy: Optional[str] = Field("CONVERT_TO_ATTENDED", description="'CONVERT_TO_ATTENDED' or 'EXEMPT_FROM_CONDUCTED'")
    targetSubjectCodes: Optional[List[str]] = Field(None, description="List of subject codes or ['ALL']")
    subjectStats: Optional[Dict[str, Dict[str, Any]]] = Field(None, description="Optional map of current subject stats")
    referenceToday: Optional[str] = Field(None, description="Reference Today date")

class ChatAdvisorRequest(BaseModel):
    query: str = Field(..., description="Student natural language question")
    sectionId: str = Field(..., description="Current section ID")
    currentSubjectCode: Optional[str] = Field(None, description="Current subject code")
    classesConducted: Optional[int] = Field(None, description="Current classes conducted")
    classesAttended: Optional[int] = Field(None, description="Current classes attended")
    attendancePercentage: Optional[float] = Field(None, description="Current attendance percentage")
    todayDate: Optional[str] = Field(None, description="Simulated current date YYYY-MM-DD")

class LeaveImpactRequest(BaseModel):
    sectionId: str = Field(..., description="Section ID")
    startDate: str = Field(..., description="Start date YYYY-MM-DD")
    endDate: str = Field(..., description="End date YYYY-MM-DD")
    reason: Optional[str] = Field("Personal Leave", description="Reason for leave")
    subjectStats: Optional[Dict[str, Dict[str, Any]]] = Field(None, description="Optional map of current subject stats")
    referenceToday: Optional[str] = Field("2026-09-28", description="Reference today date")
    threshold: Optional[float] = Field(75.0, description="Attendance threshold percentage (default 75%)")
