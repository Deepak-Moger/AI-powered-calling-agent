@echo off
echo AI Calling Agent - Starting Services
echo =====================================
echo.

echo Starting Python backend server...
start "AI Agent Backend" cmd /k python src/server.py

timeout /t 3 /nobreak > nul

echo Starting web interface...
start "AI Agent Web" cmd /k npm start

echo.
echo Services started!
echo.
echo Backend: http://localhost:5000
echo Web Interface: http://localhost:3000
echo.
echo Open http://localhost:3000 in your browser
echo.
pause
