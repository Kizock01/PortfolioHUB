@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ==========================================
 echo Gerar instalador EXE - TranscritorIA
 echo ==========================================

if not exist "desktop\resources\ffmpeg\ffmpeg.exe" (
  echo ERRO: ffmpeg.exe nao encontrado em desktop\resources\ffmpeg\ffmpeg.exe
  echo Copie o ffmpeg antes de gerar o instalador.
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

call npm run dist
if errorlevel 1 (
  echo ERRO ao gerar instalador.
  pause
  exit /b 1
)

echo Instalador gerado em dist\
pause