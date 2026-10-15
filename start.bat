@echo off
echo ================================
echo   Starting Neuro-XAI Platform
echo ================================

start "Flask Backend" cmd /k "cd /d \"%~dp0backend\" && venv\\Scripts\\activate && python app.py"

timeout /t 5 /nobreak

start "Next.js Frontend" cmd /k "cd /d \"%~dp0frontend\" && npm run dev"

echo.
echo Both servers starting...
echo Backend:  http://localhost:5000/health
echo Frontend: http://localhost:3000
echo.
pause
