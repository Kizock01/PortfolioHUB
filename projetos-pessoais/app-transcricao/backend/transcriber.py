from __future__ import annotations

import os
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

            model_dir = os.getenv("WHISPER_MODEL_DIR")
            self._model = WhisperModel(
                self.model_size,
                device="cpu",
                compute_type="int8",
                download_root=model_dir if model_dir else None,
            )
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
            no_speech_threshold=0.6,
            log_prob_threshold=-1.0,
            compression_ratio_threshold=2.4,
        )

        segments: list[dict[str, Any]] = []
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


def check_runtime_diagnostics(temp_dir: Path, model_size: str) -> dict[str, Any]:
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

    ffmpeg_path = os.getenv("FFMPEG_PATH") or shutil.which("ffmpeg")
    ffmpeg_ok = bool(ffmpeg_path)
    if not ffmpeg_ok:
        errors.append("ffmpeg nao encontrado no PATH/FFMPEG_PATH")

    temp_ok = True
    temp_err: str | None = None
    write_ok = True
    write_err: str | None = None
    try:
        temp_dir.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=temp_dir, delete=True) as _:
            pass
    except Exception as exc:
        temp_ok = False
        temp_err = str(exc)
        errors.append(f"temp_dir: {exc}")

    try:
        test_file = temp_dir / ".write_test"
        test_file.write_text("ok", encoding="utf-8")
        test_file.unlink(missing_ok=True)
    except Exception as exc:
        write_ok = False
        write_err = str(exc)
        errors.append(f"write_permission: {exc}")

    model_loadable = False
    model_error: str | None = None
    if faster_ok:
        try:
            from faster_whisper import WhisperModel

            model_dir = os.getenv("WHISPER_MODEL_DIR")
            _ = WhisperModel(model_size, device="cpu", compute_type="int8", download_root=model_dir if model_dir else None)
            model_loadable = True
        except Exception as exc:
            model_error = str(exc)
            errors.append(f"model_loadable: {exc}")

    return {
        "faster_whisper_ok": faster_ok,
        "librosa_ok": librosa_ok,
        "soundfile_ok": soundfile_ok,
        "ffmpeg_ok": ffmpeg_ok,
        "ffmpeg_path": ffmpeg_path,
        "temp_dir_ok": temp_ok,
        "temp_dir": str(temp_dir),
        "temp_dir_error": temp_err,
        "write_permission_ok": write_ok,
        "write_permission_error": write_err,
        "model_size": model_size,
        "model_loadable": model_loadable,
        "model_error": model_error,
        "errors": errors,
    }
