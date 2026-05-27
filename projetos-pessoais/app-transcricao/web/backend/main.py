from __future__ import annotations

import logging
import os
import shutil
import tempfile
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from transcriber import TranscriptionEngine, check_runtime_diagnostics

APP_NAME = "transcription-api"
APP_VERSION = "3.1.0"

DEFAULT_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")
DEFAULT_LANGUAGE = os.getenv("WHISPER_LANGUAGE", "pt")
TEMP_DIR = Path(os.getenv("TRANSCRIBE_TEMP_DIR", Path(tempfile.gettempdir()) / "app-transcricao-temp"))
TEMP_DIR.mkdir(parents=True, exist_ok=True)

LOG_DIR = Path(os.getenv("TRANSCRITOR_LOG_DIR", Path.home() / "AppData" / "Local" / "TranscritorIA" / "logs"))
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / "backend.log"

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".webm", ".mp4"}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler(LOG_FILE, encoding="utf-8"), logging.StreamHandler()],
)
logger = logging.getLogger(APP_NAME)

app = FastAPI(title=APP_NAME, version=APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = TranscriptionEngine(model_size=DEFAULT_MODEL_SIZE)


def _is_allowed_audio(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def _save_upload_to_temp(file: UploadFile) -> Path:
    suffix = Path(file.filename or "upload.bin").suffix.lower()
    temp_path = TEMP_DIR / f"{uuid.uuid4()}{suffix}"
    with temp_path.open("wb") as out:
        shutil.copyfileobj(file.file, out)
    return temp_path


@app.get("/")
def root() -> dict[str, Any]:
    return {
        "service": APP_NAME,
        "version": APP_VERSION,
        "status": "online",
        "model": DEFAULT_MODEL_SIZE,
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": APP_NAME}


@app.get("/diagnostics")
def diagnostics() -> dict[str, Any]:
    checks = check_runtime_diagnostics(TEMP_DIR, DEFAULT_MODEL_SIZE)
    checks["language"] = DEFAULT_LANGUAGE
    checks["python_version"] = os.sys.version
    checks["log_file"] = str(LOG_FILE)
    return checks


@app.post("/debug-upload")
async def debug_upload(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo nao fornecido")

    temp_path = _save_upload_to_temp(file)
    try:
        size_bytes = temp_path.stat().st_size
        logger.info("debug-upload filename=%s size=%s", file.filename, size_bytes)
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "size_bytes": size_bytes,
            "extension": temp_path.suffix.lower(),
        }
    finally:
        temp_path.unlink(missing_ok=True)


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo nao fornecido")

    if not _is_allowed_audio(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Formato invalido. Use: mp3, wav, m4a, ogg, webm, mp4",
        )

    temp_path = _save_upload_to_temp(file)
    try:
        logger.info("transcribe start filename=%s path=%s", file.filename, temp_path)
        result = engine.transcribe(temp_path, language=DEFAULT_LANGUAGE)
        logger.info("transcribe done filename=%s chars=%s", file.filename, len(result.get("text", "")))
        return result
    except RuntimeError as exc:
        logger.exception("transcribe runtime error: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("transcribe unexpected error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Falha na transcricao: {exc}") from exc
    finally:
        temp_path.unlink(missing_ok=True)


@app.post("/api/transcribe")
async def transcribe_alias(file: UploadFile = File(...)) -> dict[str, Any]:
    return await transcribe(file)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_, exc: Exception):
    logger.exception("unhandled backend exception: %s", exc)
    return JSONResponse(status_code=500, content={"detail": f"Erro interno: {exc}"})
