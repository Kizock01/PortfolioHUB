# Versao Desktop

Esta pasta contem os componentes da versao desktop.

## Estrutura
- `electron/`: processo principal e preload
- `backend/`: arquivos de build do backend para exe
- `resources/ffmpeg/`: ffmpeg embutido
- `installer/`: artefatos auxiliares

## Rodar desktop em desenvolvimento
Na raiz do projeto:
- `iniciar-desktop-dev.bat`

## Gerar instalador
Na raiz do projeto:
- `gerar-exe.bat`

Ou:
- `npm run dist`

Saida:
- `dist\\TranscritorIA Setup 1.0.0.exe`
