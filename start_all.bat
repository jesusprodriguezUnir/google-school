@echo off
echo Starting NextGen School Dashboard...
cd /d "%~dp0"

echo 1. Launching Backend Server...
start "NextGen - Backend" run_server.bat

echo 2. Launching Frontend Server...
start "NextGen - Frontend" cmd /k "npm run dev"

echo All servers starting... 
echo Backend will be at: http://localhost:8000
echo Frontend will be at: http://localhost:5173 (usually)
echo.
pause
