@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo Iniciando app web...

if not exist "iniciar-web-hidden.vbs" (
  echo ERRO: iniciar-web-hidden.vbs nao encontrado.
  pause
  exit /b 1
)

cscript //nologo "iniciar-web-hidden.vbs"
if errorlevel 1 (
  echo ERRO ao iniciar app web.
  pause
  exit /b 1
)

echo App iniciado.
exit /b 0
