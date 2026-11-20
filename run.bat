@echo off
title SAMEER'S MONEY MANAGER - Personal Finance Control Center
color 0B
echo ============================================================================
echo   SAMEER'S MONEY MANAGER
echo   Personal Finance Control Center
echo   "Your Money. Your Control. Your Future."
echo ============================================================================
echo.
echo Launching Sameer's Wealth Terminal on Google Chrome...
echo.

cd /d "%~dp0"

:: 1. Open Google Chrome with the frontend directly
start "" "frontend\index.html"

:: 2. Also start the local backend server (handles Python in PATH or AppData)
if exist "C:\Users\hp\AppData\Local\Programs\Python\Python313\python.exe" (
    "C:\Users\hp\AppData\Local\Programs\Python\Python313\python.exe" backend\server.py
) else (
    python backend\server.py
)

pause
