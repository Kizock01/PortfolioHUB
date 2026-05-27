@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ==========================================
echo Iniciar versao DESKTOP (dev)
echo ==========================================

if not exist "package.json" (
  echo ERRO: package.json da raiz nao encontrado.
  pause
  exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
  echo ERRO: .venv nao encontrada.
  pause
  exit /b 1
)

call npm install
if errorlevel 1 (
  echo ERRO ao instalar dependencias npm.
  pause
  exit /b 1
)

call npx electron --version >nul 2>&1
if errorlevel 1 (
  echo ERRO: Electron local nao esta funcional.
  echo Tente limpar e reinstalar:
  echo   rmdir /s /q node_modules
  echo   del package-lock.json
  echo   npm install
  pause
  exit /b 1
)

call npm run dev
if errorlevel 1 (
  echo ERRO ao iniciar desktop dev.
  pause
  exit /b 1
)
