@echo off
title Desligando TranscribeAI
color 0C
echo ========================================
echo      Desligando o Aplicativo...
echo ========================================
echo.

:: Força o encerramento do Python e do Node.js
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo Tudo desligado com sucesso! Pode fechar esta janela.
echo ========================================
pause