@echo off
chcp 65001 >nul
echo Encerrando processos de desenvolvimento...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
echo Processos encerrados.
pause