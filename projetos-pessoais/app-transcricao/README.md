# TranscritorIA

Projeto organizado em duas versoes independentes: web e desktop.

## Estrutura

- `web/`: versao web (Next.js + FastAPI)
- `desktop/`: versao desktop (Electron + backend embutido + ffmpeg)
- `shared/`: codigo reutilizavel

## Versao web

Use para desenvolvimento tradicional via terminal.

Scripts:
- `iniciar-web.bat`

Manual:
- Backend: `.venv\\Scripts\\python.exe web\\backend\\app_entry.py`
- Frontend: `npm --prefix web\\frontend run dev`

URLs:
- Frontend: `http://localhost:3000`
- Backend health: `http://127.0.0.1:8000/health`
- Backend diagnostics: `http://127.0.0.1:8000/diagnostics`

## Versao desktop

Use para testar o aplicativo desktop e gerar instalador.

Scripts:
- `iniciar-desktop-dev.bat`
- `gerar-exe.bat`

Comandos equivalentes:
- Desktop dev: `npm run dev`
- Build instalador: `npm run dist`

Saida do instalador:
- `dist\\TranscritorIA Setup 1.0.0.exe`

## O que o usuario final precisa instalar?

Nada manualmente para uso normal do instalador.

- Python: embutido no `backend.exe` (PyInstaller)
- FFmpeg: embutido em `desktop/resources/ffmpeg/ffmpeg.exe`
- Node.js: apenas para desenvolvimento/build

## Logs

- Backend: `AppData/Local/TranscritorIA/logs/backend.log`
- Electron: `AppData/Roaming/transcritoria-desktop/logs/electron.log`

## Observacoes

- O backend usa `faster-whisper` por padrao.
- O modelo e baixado no primeiro uso e cacheado localmente.
- O endpoint `/diagnostics` mostra status de dependencias e modelo.
