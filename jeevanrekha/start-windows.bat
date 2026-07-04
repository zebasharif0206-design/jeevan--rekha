@echo off
rem ============================================================
rem  Jeevanrekha - local launcher for Windows
rem  Double-click this file to start the app on http://localhost:8080
rem ============================================================
title Jeevanrekha local server
cd /d "%~dp0"

echo.
echo ============================================================
echo   Jeevanrekha - First Responder App
echo ============================================================
echo.

rem ---- Try Python 3 first (most reliable, ships with Python 3.x) ----
where python >nul 2>&1
if %errorlevel%==0 (
  echo Found Python. Starting server at http://localhost:8080
  echo Press Ctrl+C in this window to stop.
  echo.
  start "" http://localhost:8080
  python -m http.server 8080
  goto :done
)

rem ---- Try the Windows Python launcher ----
where py >nul 2>&1
if %errorlevel%==0 (
  echo Found Python launcher. Starting server at http://localhost:8080
  echo Press Ctrl+C in this window to stop.
  echo.
  start "" http://localhost:8080
  py -3 -m http.server 8080
  goto :done
)

rem ---- Try Node.js as a fallback ----
where npx >nul 2>&1
if %errorlevel%==0 (
  echo Found Node.js. Starting server at http://localhost:8080
  echo Press Ctrl+C in this window to stop.
  echo.
  start "" http://localhost:8080
  npx --yes http-server -p 8080 -c-1 .
  goto :done
)

rem ---- Neither runtime is available ----
echo.
echo ERROR: Neither Python nor Node.js is installed on this PC.
echo.
echo The app needs a tiny local web server to run. Install one of these:
echo.
echo   1. Python  - https://www.python.org/downloads/  (easy, recommended)
echo   2. Node.js - https://nodejs.org/
echo.
echo After installing, double-click start-windows.bat again.
echo.
pause
exit /b 1

:done
echo.
echo Server stopped. Press any key to close this window.
pause >nul
