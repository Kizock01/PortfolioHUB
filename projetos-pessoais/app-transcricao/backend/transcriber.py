# backend/transcriber.py
"""
Transcrição com foco em fidelidade ao áudio (anti-alucinação).
"""

import logging
import re
from dataclasses import dataclass
from typing import List

import librosa
import numpy as np
import whisper

logger = logging.getLogger(__name__)


@dataclass
class TranscriptionResult:
    text: str
    raw_text: str
    corrected_text: str
    language: str
    duration: float
    segments: List[dict]
    confidence: float
    difficulty_level: str


class ConservativeCorrector:
    """Somente ajustes conservadores: capitalização e pontuação básica."""

    @staticmethod
    def normalize_spacing(text: str) -> str:
        text = re.sub(r"\s+", " ", text).strip()
        return text

    @staticmethod
    def sentence_case(text: str) -> str:
        if not text:
            return text
        text = text[0].upper() + text[1:]
        text = re.sub(r"([.!?]\s+)([a-zà-ú])", lambda m: m.group(1) + m.group(2).upper(), text)
        return text

    def enhance_text(self, text: str) -> str:
        out = self.normalize_spacing(text)
        out = self.sentence_case(out)
        if out and out[-1] not in ".!?":
            out += "."
        return out


class AdvancedTranscriber:
    def __init__(self, model_size: str = "base", device: str = "cpu"):
        self.model_size = model_size
        self.device = device
        self.model = None
        self.corrector = ConservativeCorrector()
        self._load_model()

    def _load_model(self):
        logger.info("Carregando Whisper %s em %s", self.model_size, self.device)
        self.model = whisper.load_model(self.model_size, device=self.device)
        logger.info("Modelo Whisper carregado")

    @staticmethod
    def _segment_confidence(avg_logprob: float) -> float:
        return max(0.0, min(1.0, 1.0 + (avg_logprob / 5.0)))

    @staticmethod
    def _anti_repetition(segments: List[dict]) -> List[dict]:
        filtered = []
        for seg in segments:
            text_key = (seg.get("text") or "").strip().lower()
            if filtered:
                prev = filtered[-1]
                prev_key = (prev.get("text") or "").strip().lower()
                # Remove repetição consecutiva com baixa confiança.
                if text_key and text_key == prev_key and seg.get("confidence", 0) < 0.7:
                    continue
            filtered.append(seg)
        return filtered

    @staticmethod
    def _chunk_ranges(duration_seconds: float, chunk_seconds: int = 15) -> List[tuple[float, float]]:
        if duration_seconds <= 0:
            return [(0.0, 0.0)]
        ranges = []
        start = 0.0
        while start < duration_seconds:
            end = min(duration_seconds, start + chunk_seconds)
            ranges.append((start, end))
            start = end
        return ranges

    def transcribe(self, audio_path: str, language: str = "pt", difficulty_level: str = "medium") -> TranscriptionResult:
        audio, sr = librosa.load(audio_path, sr=16000)
        duration_seconds = len(audio) / sr if len(audio) else 0.0
        chunks = self._chunk_ranges(duration_seconds, chunk_seconds=15)

        all_segments: List[dict] = []
        chunk_texts: List[str] = []

        for start, end in chunks:
            result = self.model.transcribe(
                audio_path,
                language="pt",
                task="transcribe",
                fp16=(self.device == "cuda"),
                temperature=0,
                beam_size=5,
                best_of=5,
                condition_on_previous_text=False,
                no_speech_threshold=0.6,
                logprob_threshold=-1.0,
                compression_ratio_threshold=2.4,
                word_timestamps=False,
                initial_prompt=None,
            ) if (start == 0.0 and end == duration_seconds) else self.model.transcribe(
                audio[int(start * sr): int(end * sr)],
                language="pt",
                task="transcribe",
                fp16=(self.device == "cuda"),
                temperature=0,
                beam_size=5,
                best_of=5,
                condition_on_previous_text=False,
                no_speech_threshold=0.6,
                logprob_threshold=-1.0,
                compression_ratio_threshold=2.4,
                word_timestamps=False,
                initial_prompt=None,
            )

            segments_raw = result.get("segments", []) or []
            for seg in segments_raw:
                seg_text = (seg.get("text") or "").strip()
                avg_logprob = float(seg.get("avg_logprob", -1.2))
                conf = self._segment_confidence(avg_logprob)
                uncertain = conf < 0.6
                all_segments.append(
                    {
                        "id": len(all_segments),
                        "start": float(seg.get("start", 0.0)) + start,
                        "end": float(seg.get("end", 0.0)) + start,
                        "text": seg_text,
                        "confidence": conf,
                        "uncertain": uncertain,
                    }
                )
                if seg_text:
                    chunk_texts.append(seg_text)

        all_segments = self._anti_repetition(all_segments)

        raw_text = " ".join(s["text"] for s in all_segments if s.get("text")).strip()
        corrected_text = self.corrector.enhance_text(raw_text)
        avg_conf = (
            sum(float(s.get("confidence", 0.0)) for s in all_segments) / len(all_segments)
            if all_segments
            else 0.0
        )

        return TranscriptionResult(
            text=corrected_text,
            raw_text=raw_text,
            corrected_text=corrected_text,
            language=language,
            duration=duration_seconds,
            segments=all_segments,
            confidence=avg_conf,
            difficulty_level=difficulty_level,
        )

    def transcribe_with_multipass(self, audio_path: str, language: str = "pt", difficulty_level: str = "hard", passes: int = 2) -> TranscriptionResult:
        best = None
        for _ in range(max(1, passes)):
            current = self.transcribe(audio_path, language, difficulty_level)
            if best is None or current.confidence > best.confidence:
                best = current
        return best

    def get_model_info(self) -> dict:
        return {
            "model_size": self.model_size,
            "device": self.device,
            "model_loaded": self.model is not None,
            "engine": "openai-whisper",
            "anti_hallucination": True,
        }
