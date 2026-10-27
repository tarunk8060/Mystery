@echo off
title AI Mystery Room Launcher
echo ========================================================
echo   AI MYSTERY ROOM - AI Detective & Case Solver
echo ========================================================
echo.
echo Starting Backend Server on port 5000...
start "AI Mystery Room - Backend API" cmd /k "cd server && npm start"

echo Starting Frontend Web App on port 5173...
start "AI Mystery Room - Client" cmd /k "cd client && npm run dev"

echo.
echo Opening browser to http://localhost:5173...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo AI Mystery Room is running!
echo Backend:  http://localhost:5000/api/health
echo Frontend: http://localhost:5173
echo.
