@echo off
echo ==========================================
echo    STARTING GIGSHIELD FULLSTACK PROTOTYPE
echo ==========================================
echo.
echo 1. Starting Node.js Backend API (Port 5000)...
start cmd /k "cd backend && node src/server.js"

echo 2. Starting Vite React Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting. 
echo Please open http://localhost:5173 in your browser if it doesn't open automatically.
pause
