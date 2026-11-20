@echo off
title Push SAMEER'S MONEY MANAGER to GitHub
color 0A
echo ============================================================================
echo   SAMEER'S MONEY MANAGER - GitHub Push Utility
echo ============================================================================
echo.

cd /d "%~dp0"

echo Git Status:
git status
echo.

set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/sameers-money-manager.git): "

if "%REPO_URL%"=="" (
    echo Error: Repository URL cannot be empty!
    pause
    exit /b
)

echo.
echo Adding remote origin: %REPO_URL%
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo Pushing main branch to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================================
    echo   SUCCESS! Sameer's Money Manager has been pushed to GitHub!
    echo ============================================================================
) else (
    echo.
    echo PUSH FAILED. Please ensure:
    echo 1. The GitHub repository exists.
    echo 2. You are signed in with your GitHub Personal Access Token or credentials.
)

pause
