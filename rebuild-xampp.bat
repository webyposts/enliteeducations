@echo off
cd /d "%~dp0"
echo Building Enlite Educations for XAMPP...
call npm.cmd run build
if errorlevel 1 (
  echo Build failed.
  exit /b 1
)
echo.
echo Open: http://localhost/enliteeducations/
