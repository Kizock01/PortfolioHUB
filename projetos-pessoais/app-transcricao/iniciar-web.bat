@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ==========================================
echo Iniciar versao WEB - TranscritorIA
echo ==========================================

if not exist ".venv\Scripts\python.exe" (
  echo ERRO: .venv nao encontrada em "%cd%"
  echo Crie a venv antes: python -m venv .venv
  pause
  exit /b 1
)

if not exist "web\backend\requirements.txt" (
  echo ERRO: web\backend\requirements.txt nao encontrado
  pause
  exit /b 1
)

if not exist "web\frontend\package.json" (
  echo ERRO: web\frontend\package.json nao encontrado
  pause
  exit /b 1
)

echo [1/3] Instalando dependencias backend...
".venv\Scripts\python.exe" -m pip install -r "web\backend\requirements.txt"
if errorlevel 1 (
  echo ERRO ao instalar backend.
  pause
  exit /b 1
)

echo [2/3] Instalando dependencias frontend...
call npm --prefix "web\frontend" install
if errorlevel 1 (
  echo ERRO ao instalar frontend.
  pause
  exit /b 1
)

echo [3/3] Iniciando backend e frontend...
start "TranscritorIA Backend WEB" cmd /k "cd /d "%cd%" && .venv\Scripts\python.exe web\backend\app_entry.py"
start "TranscritorIA Frontend WEB" cmd /k "cd /d "%cd%" && npm --prefix web\frontend run dev"

echo WEB iniciado:
echo - Backend:  http://127.0.0.1:8000/health
echo - Frontend: http://localhost:3000
pause