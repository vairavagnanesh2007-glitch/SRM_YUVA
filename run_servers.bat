@echo off
echo ============================================================
echo   OVERWORLD HACKATHON - ATTENDANCE PREDICTOR LAUNCHER
echo ============================================================
echo.
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Attendance Predictor - Backend" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

echo.
echo Starting Vite Frontend on http://127.0.0.1:5173 ...
cd frontend
start "Attendance Predictor - Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ============================================================
echo   Both services are launching!
echo   Frontend: http://127.0.0.1:5173
echo   Backend:  http://127.0.0.1:8000
echo   API Docs: http://127.0.0.1:8000/docs
echo ============================================================
pause
