@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ==========================================
echo TranscritorIA - Menu rapido
echo ==========================================
echo Escolha uma opcao:
echo 1. Iniciar web
echo 2. Iniciar desktop dev
echo 3. Gerar instalador exe
echo.
set /p option="Opcao [1-3]: "

if "%option%"=="1" call iniciar-web.bat
if "%option%"=="2" call iniciar-desktop-dev.bat
if "%option%"=="3" call gerar-exe.bat
if not "%option%"=="1" if not "%option%"=="2" if not "%option%"=="3" (
  echo Opcao invalida.
  pause
  exit /b 1
)