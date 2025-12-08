@echo off
cd /d "%~dp0"
echo Starting Backend Server...
uvicorn backend.main:app --reload
pause
