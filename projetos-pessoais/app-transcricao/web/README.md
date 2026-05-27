# Versao Web

Esta pasta contem a versao web separada do app.

## Estrutura
- `frontend/`: Next.js
- `backend/`: FastAPI + faster-whisper
- `scripts/`: utilitarios web

## Rodar em desenvolvimento
Na raiz do projeto, execute:
- `iniciar-web.bat`

Ou manualmente:
- `..\\.venv\\Scripts\\python.exe backend\\app_entry.py`
- `npm --prefix frontend run dev`

## Endpoints
- `GET http://127.0.0.1:8000/health`
- `GET http://127.0.0.1:8000/diagnostics`
- `POST http://127.0.0.1:8000/transcribe`
