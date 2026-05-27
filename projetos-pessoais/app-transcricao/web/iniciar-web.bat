@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ==========================================
echo Iniciar versao WEB - TranscritorIA
echo ==========================================

where node >nul 2>&1
if errorlevel 1 (
  echo ERRO: node nao encontrado no PATH.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo ERRO: npm nao encontrado no PATH.
  pause
  exit /b 1
)

where python >nul 2>&1
if errorlevel 1 (
  echo ERRO: python nao encontrado no PATH.
  pause
  exit /b 1
)

where pip >nul 2>&1
if errorlevel 1 (
  echo ERRO: pip nao encontrado no PATH.
  pause
  exit /b 1
)

if not exist "backend\main.py" (
  echo ERRO: backend\main.py nao encontrado.
  pause
  exit /b 1
)

if not exist "frontend\package.json" (
  echo ERRO: frontend\package.json nao encontrado.
  pause
  exit /b 1
)

if not exist "frontend\.env.local" (
  echo NEXT_PUBLIC_API_URL=http://localhost:8000>"frontend\.env.local"
  echo Criado frontend\.env.local
)

if not exist "frontend\node_modules" (
  echo AVISO: node_modules nao encontrado em frontend.
  echo Rode: cd frontend ^&^& npm install
)

echo Encerrando processos antigos nas portas 8000 e 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1

echo Iniciando backend em http://127.0.0.1:8000 ...
start "WEB Backend" cmd /k "cd /d ""%~dp0backend"" && if exist ""..\.venv\Scripts\python.exe"" (""..\.venv\Scripts\python.exe"" -m uvicorn main:app --reload --host 127.0.0.1 --port 8000) else (python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000)"

timeout /t 3 /nobreak >nul

echo Iniciando frontend em http://localhost:3000 ...
start "WEB Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo Aguardando porta 3000 ficar ativa...
set PORT_READY=0
for /l %%i in (1,1,30) do (
  for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do set PORT_READY=1
  if "!PORT_READY!"=="1" goto :openbrowser
  timeout /t 1 /nobreak >nul
)

:openbrowser
echo Abrindo navegador em http://localhost:3000 ...
start "" "http://localhost:3000"

echo Pronto.
echo Backend health: http://localhost:8000/health
echo Frontend: http://localhost:3000
pause