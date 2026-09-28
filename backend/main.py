from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.routes.sections import router as sections_router
from backend.routes.attendance import router as attendance_router
from backend.routes.simulation import router as simulation_router
from backend.routes.od import router as od_router
from backend.routes.chat import router as chat_router
from backend.routes.dashboard import router as dashboard_router
from backend.services.timetable_service import timetable_service

app = FastAPI(
    title="Overworld Attendance Predictor API (Phase 1 & 2)",
    description="Authoritative calculation engine, real timetable schedule matrix, On-Duty simulator, and AI Advisor chatbot.",
    version="2.0.0"
)

# Enable CORS for frontend Vite dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(sections_router)
app.include_router(attendance_router)
app.include_router(simulation_router)
app.include_router(od_router)
app.include_router(chat_router)
app.include_router(dashboard_router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "status": "error"}
    )

@app.get("/")
def root():
    return {
        "message": "Overworld Attendance Predictor API is operational (Phase 1 & Phase 2).",
        "version": "2.0.0",
        "semesterStart": timetable_service.semester_start,
        "semesterEnd": timetable_service.semester_end,
        "sectionsAvailable": len(timetable_service.get_all_sections()),
        "endpoints": [
            "GET /api/sections",
            "GET /api/sections/{section_id}/subjects",
            "GET /api/sections/{section_id}/timetable",
            "POST /api/attendance/calculate",
            "POST /api/attendance/plan",
            "POST /api/attendance/simulate",
            "GET /api/attendance/upcoming",
            "GET /api/attendance/calendar",
            "POST /api/od/simulate",
            "POST /api/chat/advisor",
            "GET /api/dashboard/{section_id}"
        ]
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Attendance Predictor Backend Phase 1 & 2"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
