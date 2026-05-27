@echo off
chcp 65001 >nul
title Iniciador - App de Transcricao
color 0B

echo ===================================================
echo      Iniciando o Sistema (Versao Otimizada)
echo ===================================================
echo.

:: 1. Verificando e Iniciando o Backend
echo [1/2] Verificando o motor da Inteligencia Artificial...
cd backend
if not exist "venv\Scripts\activate.bat" (
    echo Criando ambiente virtual Python...
    python -m venv venv
    echo Instalando dependencias do servidor...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    echo Motor IA pronto.
)
echo Abrindo o servidor Python em uma janela separada...
start "Motor IA (Backend)" cmd /k "venv\Scripts\activate.bat && python main.py"
cd ..

echo.

:: 2. Verificando e Iniciando o Frontend
echo [2/2] Verificando a Interface Visual...
cd frontend
if not exist "node_modules\" (
    echo Instalando pacotes da interface (pode demorar um pouco)...
    call npm install
) else (
    echo Interface pronta.
)
echo Abrindo o servidor Web em uma janela separada...
start "Interface (Frontend)" cmd /k "npm run dev"
cd ..

echo.
echo ===================================================
echo  Tudo pronto! 
echo.
echo  - O servidor Python esta operando no fundo.
echo  - Acesse no navegador: http://localhost:3000
echo ===================================================
pause