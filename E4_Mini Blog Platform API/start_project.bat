@echo off
echo Starting Corporate Blog System...
start "Blog Server" cmd /k "cd server && npm run dev"
start "Blog Client" cmd /k "cd client && npm run dev"
echo System started!
echo Server: http://localhost:5000
echo Client: http://localhost:5173
pause
