@echo off
title KSA Skilled - Local Preview
cd /d "%~dp0"

echo.
echo Starting KSA Skilled Development...
echo.

REM stop old node on port 5000 if any
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
)

cd backend
start "KSA-API" cmd /k "node src/index.js"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  LOCAL SITE:  http://localhost:5000
echo  API HEALTH:  http://localhost:5000/api/health
echo ========================================
echo.
echo Opening browser...
start "" "http://localhost:5000"

echo.
echo Keep this window open. To stop: close the KSA-API window.
pause
