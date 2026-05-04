@echo off
echo [CyberEye AI] Starting all services LOCALLY...

:: Check for requirements
where mvn >nul 2>nul
if %errorlevel% neq 0 (echo ERROR: Maven (mvn) not found in PATH! && pause && exit)

where npm >nul 2>nul
if %errorlevel% neq 0 (echo ERROR: npm not found in PATH! && pause && exit)

where python >nul 2>nul
if %errorlevel% neq 0 (echo ERROR: python not found in PATH! && pause && exit)

:: Clear prod env vars just in case
set ML_SERVICE_URL=
set VITE_API_BASE_URL=

echo Starting ML Service...
start "CyberEye ML Service" cmd /k "cd ml-service && venv\Scripts\python.exe -m uvicorn main:app --port 8000"

echo Starting Backend...
start "CyberEye Backend" cmd /k "cd backend && mvn spring-boot:run"

echo Starting Frontend...
start "CyberEye Frontend" cmd /k "cd frontend && npm run dev -- --port 5173"

echo.
echo ======================================================
echo All services are starting in separate windows.
echo PLEASE WAIT 10-20 SECONDS FOR BACKEND TO START.
echo.
echo URL: http://localhost:5173
echo ======================================================
echo.
pause
