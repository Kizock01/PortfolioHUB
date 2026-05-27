@echo off
REM quick-start.bat - Script para iniciar TranscribeAI rapidamente no Windows

setlocal enabledelayedexpansion
set GREEN=[92m
set BLUE=[94m
set RED=[91m
set RESET=[0m

echo %BLUE%====================================%RESET%
echo %BLUE%  TranscribeAI v2.0 - Windows%RESET%
echo %BLUE%====================================%RESET%
echo.

REM Menu de opções
echo Escolha uma opção:
echo 1. Iniciar Frontend
echo 2. Iniciar Backend
echo 3. Instalar Dependências
echo 4. Ambos (abrir em janelas separadas)
echo.

set /p option="Opção [1-4]: "

if "%option%"=="1" (
    echo.
    echo %BLUE%=== Frontend (http://localhost:3000) ===%RESET%
    cd frontend
    call npm install
    call npm run dev
) else if "%option%"=="2" (
    echo.
    echo %BLUE%=== Backend (http://localhost:8000) ===%RESET%
    cd backend
    if not exist venv (
        python -m venv venv
    )
    call venv\Scripts\activate
    pip install -r requirements.txt
    python main.py
) else if "%option%"=="3" (
    echo.
    echo %BLUE%=== Instalando Dependências ===%RESET%
    
    echo.
    echo Frontend...
    cd frontend
    call npm install
    cd ..
    
    echo.
    echo Backend...
    cd backend
    if not exist venv (
        python -m venv venv
    )
    call venv\Scripts\activate
    pip install -r requirements.txt
    cd ..
    
    echo.
    echo %GREEN%Dependências instaladas!%RESET%
) else if "%option%"=="4" (
    echo.
    echo %BLUE%=== Iniciando ambos em janelas separadas ===%RESET%
    
    REM Frontend
    start cmd /k "cd frontend && npm install && npm run dev"
    
    REM Backend
    timeout /t 3 /nobreak
    start cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python main.py"
    
    echo.
    echo %GREEN%Frontend: http://localhost:3000%RESET%
    echo %GREEN%Backend: http://localhost:8000%RESET%
) else (
    echo %RED%Opção inválida%RESET%
    exit /b 1
)

pause
