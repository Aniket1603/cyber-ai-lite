@echo off
echo [CyberEye AI] Starting with PRODUCTION links...

:: 1. Start ML Service (Local, but we point Backend to Prod if desired)
:: Note: If you want to use the REMOTE ML service, the Backend will handle it.

:: 2. Set Backend to use Production ML Service
set ML_SERVICE_URL=https://cyber-ai-lite-5.onrender.com

:: 3. Set Frontend to use Production Backend
set VITE_API_BASE_URL=https://cyber-ai-lite-2.onrender.com

echo.
echo Production Backend: %VITE_API_BASE_URL%
echo Production ML Service: %ML_SERVICE_URL%
echo.

echo Starting Frontend...
cd frontend
npm run dev -- --port 5173
