@echo off
cd /d "%~dp0"
echo Seeding Database...
python -m backend.seed
pause
