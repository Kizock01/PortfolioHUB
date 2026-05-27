from __future__ import annotations

import shutil
import tempfile
from pathlib import Path
from typing import Any


def _check_import(module_name: str) -> tuple[bool, str | None]:
    try:
        __import__(module_name)
        return True, None
    except Exception as exc:
        return False, str(exc)


class TranscriptionEngine:
    """Small wrapper around faster-whisper with lazy model loading."""

    def __init__(self, model_size: str = "small") -> None:
        self.model_size = model_size
        self._model = None
        self._model_error: str | None = None

    def _load_model(self):
        if self._model is not None:
            return self._model
        if self._model_error:
            raise RuntimeError(self._model_error)

        try:
            from faster_whisper import WhisperModel

            # CPU int8 is a stable default on Windows and avoids CUDA dependency.
            self._model = WhisperModel(self.model_size, device="cpu", compute_type="int8")
            return self._model
        except Exception as exc:
            self._model_error = f"faster-whisper indisponivel: {exc}"
            raise RuntimeError(self._model_error) from exc

    def transcribe(self, audio_path: Path, language: str = "pt") -> dict[str, Any]:
        model = self._load_model()
        segments_iter, info = model.transcribe(
            str(audio_path),
            language=language,
            task="transcribe",
            beam_size=5,
            temperature=0,
            vad_filter=True,
            condition_on_previous_text=False,
        )

        segments = []
        full_text_parts: list[str] = []
        confidences: list[float] = []

        for idx, segment in enumerate(segments_iter):
            text = (segment.text or "").strip()
            if text:
                full_text_parts.append(text)

            avg_logprob = float(getattr(segment, "avg_logprob", -1.0))
            conf = max(0.0, min(1.0, 1.0 + (avg_logprob / 5.0)))
            confidences.append(conf)

            segments.append(
                {
                    "id": idx,
                    "start": float(segment.start),
                    "end": float(segment.end),
                    "text": text,
                    "confidence": round(conf, 4),
                }
            )

        text = " ".join(full_text_parts).strip()
        confidence = round(sum(confidences) / len(confidences), 4) if confidences else 0.0

        return {
            "text": text,
            "language": getattr(info, "language", language) or language,
            "segments": segments,
            "confidence": confidence,
        }


def check_runtime_diagnostics(temp_dir: Path) -> dict[str, Any]:
    errors: list[str] = []

    faster_ok, faster_err = _check_import("faster_whisper")
    if faster_err:
        errors.append(f"faster-whisper: {faster_err}")

    librosa_ok, librosa_err = _check_import("librosa")
    if librosa_err:
        errors.append(f"librosa: {librosa_err}")

    soundfile_ok, soundfile_err = _check_import("soundfile")
    if soundfile_err:
        errors.append(f"soundfile: {soundfile_err}")

    ffmpeg_ok = shutil.which("ffmpeg") is not None
    if not ffmpeg_ok:
        errors.append("ffmpeg nao encontrado no PATH")

    temp_ok = True
    temp_err: str | None = None
    try:
        temp_dir.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=temp_dir, delete=True) as _:
            pass
    except Exception as exc:
        temp_ok = False
        temp_err = str(exc)
        errors.append(f"temp_dir: {exc}")

    return {
        "faster_whisper_ok": faster_ok,
        "librosa_ok": librosa_ok,
        "soundfile_ok": soundfile_ok,
        "ffmpeg_ok": ffmpeg_ok,
        "temp_dir_ok": temp_ok,
        "temp_dir": str(temp_dir),
        "temp_dir_error": temp_err,
        "errors": errors,
    }
