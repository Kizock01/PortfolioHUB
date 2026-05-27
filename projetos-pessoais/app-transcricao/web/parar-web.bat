@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

set "RUNTIME_DIR=%~dp0.runtime"

echo Parando app web...

if exist "%RUNTIME_DIR%\backend.pid" (
  set /p BACKEND_PID=<"%RUNTIME_DIR%\backend.pid"
  if not "%BACKEND_PID%"=="" taskkill /PID %BACKEND_PID% /T /F >nul 2>&1
  del /q "%RUNTIME_DIR%\backend.pid" >nul 2>&1
)

if exist "%RUNTIME_DIR%\frontend.pid" (
  set /p FRONTEND_PID=<"%RUNTIME_DIR%\frontend.pid"
  if not "%FRONTEND_PID%"=="" taskkill /PID %FRONTEND_PID% /T /F >nul 2>&1
  del /q "%RUNTIME_DIR%\frontend.pid" >nul 2>&1
)

echo App web parado.
exit /b 0
