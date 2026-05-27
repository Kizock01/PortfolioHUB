# backend/audio_processor.py
"""
Sistema avançado de processamento de áudio para transcrição.
Inclui redução de ruído, VAD, normalização e pré-processamento inteligente.
"""

import io
import numpy as np
import librosa
import soundfile as sf
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class AudioProcessor:
    """Processa áudio com técnicas avançadas de limpeza e normalização."""
    
    def __init__(self, sr: int = 16000):
        self.sr = sr
        self.target_loudness = -20.0  # LUFS
    
    def load_audio(self, file_path: str) -> Tuple[np.ndarray, int]:
        """Carrega áudio de arquivo."""
        try:
            audio, sr = librosa.load(file_path, sr=self.sr)
            return audio, sr
        except Exception as e:
            logger.error(f"Erro ao carregar áudio: {e}")
            raise
    
    def reduce_noise(self, audio: np.ndarray, stationary: bool = True) -> np.ndarray:
        """
        Reduz ruído de fundo usando técnicas espectrais.
        
        Args:
            audio: Array de áudio
            stationary: Se usar ruído estacionário
        
        Returns:
            Áudio com ruído reduzido
        """
        try:
            # Usar redução de ruído estacionário
            from noisereduce import reduce_noise as nr
            
            # Calcular duração do ruído (primeiros 1s)
            noise_dur_sr = int(self.sr * 1.0)
            audio_reduced = nr(
                y=audio,
                sr=self.sr,
                stationary=stationary,
                prop_decrease=1.0
            )
            return audio_reduced
        except Exception as e:
            logger.warning(f"Erro na redução de ruído: {e}")
            return audio
    
    def normalize_loudness(self, audio: np.ndarray, target_loudness: float = -20.0) -> np.ndarray:
        """
        Normaliza loudness usando loudness integrado.
        
        Args:
            audio: Array de áudio
            target_loudness: Loudness alvo em LUFS
        
        Returns:
            Áudio normalizado
        """
        try:
            # Calcular RMS
            rms = np.sqrt(np.mean(audio ** 2))
            if rms > 0:
                # Converter para dB
                current_db = 20 * np.log10(rms)
                gain_db = target_loudness - current_db
                gain_linear = 10 ** (gain_db / 20)
                audio_normalized = audio * gain_linear
                # Limitar clipping
                audio_normalized = np.clip(audio_normalized, -1.0, 1.0)
                return audio_normalized
            return audio
        except Exception as e:
            logger.warning(f"Erro na normalização: {e}")
            return audio
    
    def enhance_speech(self, audio: np.ndarray) -> np.ndarray:
        """
        Realça características de fala usando filtros.
        
        Returns:
            Áudio com fala realçada
        """
        try:
            # Aplicar filtro passa-alta para remover baixas frequências (ruído)
            # E filtro passa-baixa para remover altas frequências (sibilância)
            from scipy import signal
            
            # Filtro passa-alta em 80Hz
            sos_hp = signal.butter(4, 80, 'hp', fs=self.sr, output='sos')
            audio = signal.sosfilt(sos_hp, audio)
            
            # Filtro passa-baixa em 8000Hz
            sos_lp = signal.butter(4, 8000, 'lp', fs=self.sr, output='sos')
            audio = signal.sosfilt(sos_lp, audio)
            
            return audio
        except Exception as e:
            logger.warning(f"Erro na realçação de fala: {e}")
            return audio
    
    def process_pipeline(
        self,
        audio: np.ndarray,
        reduce_noise: bool = True,
        enhance_speech: bool = True,
        normalize: bool = True
    ) -> np.ndarray:
        """
        Pipeline completo de processamento de áudio.
        
        Args:
            audio: Array de áudio
            reduce_noise: Se deve reduzir ruído
            enhance_speech: Se deve realçar fala
            normalize: Se deve normalizar loudness
        
        Returns:
            Áudio processado
        """
        # Ordem importa: ruído → realce → normalização
        
        if reduce_noise:
            audio = self.reduce_noise(audio)
            logger.info("Ruído reduzido")
        
        if enhance_speech:
            audio = self.enhance_speech(audio)
            logger.info("Fala realçada")
        
        if normalize:
            audio = self.normalize_loudness(audio)
            logger.info("Loudness normalizado")
        
        return audio

    def process_by_level(self, audio: np.ndarray, level: str = "normal") -> np.ndarray:
        """
        Níveis de processamento para controlar agressividade de limpeza.
        - normal: mínima intervenção para preservar fala.
        - hard: limpeza moderada para áudio difícil.
        - experimental: limpeza agressiva (pode degradar inteligibilidade).
        """
        level = (level or "normal").lower()

        if level == "normal":
            # Evitar distorção: somente normalização leve.
            return self.normalize_loudness(audio, target_loudness=-22.0)

        if level == "hard":
            # Moderado: ruído parcial + normalização.
            audio = self.reduce_noise(audio, stationary=False)
            return self.normalize_loudness(audio, target_loudness=-21.0)

        if level == "experimental":
            # Agressivo: ruído + realce + normalização.
            return self.process_pipeline(
                audio,
                reduce_noise=True,
                enhance_speech=True,
                normalize=True,
            )

        return audio
    
    def save_audio(self, audio: np.ndarray, output_path: str) -> None:
        """Salva áudio em arquivo."""
        sf.write(output_path, audio, self.sr)


class VoiceActivityDetector:
    """Detecta atividade de voz usando Silero VAD."""
    
    def __init__(self, sr: int = 16000):
        self.sr = sr
        self.vad_model = None
        self._load_model()
    
    def _load_model(self):
        """Carrega modelo Silero VAD."""
        try:
            torch = __import__('torch')
            # Usar modelo de repositório
            self.vad_model = torch.hub.load(
                'snakers4/silero-vad',
                'silero_vad',
                force_reload=False
            )
            logger.info("Modelo Silero VAD carregado")
        except Exception as e:
            logger.warning(f"Erro ao carregar Silero VAD: {e}")
            self.vad_model = None
    
    def detect_speech_segments(
        self,
        audio: np.ndarray,
        threshold: float = 0.5
    ) -> list:
        """
        Detecta segmentos de voz no áudio.
        
        Args:
            audio: Array de áudio
            threshold: Threshold de confiança
        
        Returns:
            Lista de (start, end) para segmentos com voz
        """
        if self.vad_model is None:
            logger.warning("Modelo VAD não disponível, retornando áudio completo")
            return [(0, len(audio))]
        
        try:
            torch = __import__('torch')
            
            # Preparar áudio
            audio_torch = torch.from_numpy(audio).float()
            
            # Obter probabilidades de voz
            with torch.no_grad():
                speech_probs = self.vad_model(audio_torch, self.sr)
            
            # Encontrar segmentos
            speech_frames = (speech_probs > threshold).cpu().numpy()
            segments = []
            in_segment = False
            start = 0
            
            for i, is_speech in enumerate(speech_frames):
                if is_speech and not in_segment:
                    start = i
                    in_segment = True
                elif not is_speech and in_segment:
                    segments.append((start, i))
                    in_segment = False
            
            if in_segment:
                segments.append((start, len(speech_frames)))
            
            return segments
        except Exception as e:
            logger.error(f"Erro na detecção de voz: {e}")
            return [(0, len(audio))]
    
    def extract_speech_segments(
        self,
        audio: np.ndarray,
        segments: list,
        padding: float = 0.1
    ) -> np.ndarray:
        """
        Extrai segmentos de voz com padding.
        
        Args:
            audio: Array de áudio
            segments: Lista de (start, end)
            padding: Padding em segundos
        
        Returns:
            Áudio com apenas segmentos de voz
        """
        padding_samples = int(padding * self.sr)
        extracted = []
        
        for start, end in segments:
            start = max(0, start - padding_samples)
            end = min(len(audio), end + padding_samples)
            extracted.append(audio[start:end])
        
        if extracted:
            return np.concatenate(extracted)
        return audio


class AudioQualityAnalyzer:
    """Analisa qualidade do áudio para determinar estratégia de processamento."""
    
    def __init__(self, sr: int = 16000):
        self.sr = sr
    
    def analyze_snr(self, audio: np.ndarray) -> float:
        """
        Estima SNR (Signal-to-Noise Ratio).
        
        Returns:
            SNR em dB
        """
        try:
            # Usar primeira parte como ruído (assumir que começa com silêncio)
            noise_dur_sr = int(self.sr * 0.5)
            noise = audio[:noise_dur_sr]
            signal_part = audio[noise_dur_sr:]
            
            noise_power = np.mean(noise ** 2)
            signal_power = np.mean(signal_part ** 2)
            
            if noise_power > 0:
                snr_db = 10 * np.log10(signal_power / noise_power)
                return snr_db
            return 20.0
        except Exception as e:
            logger.warning(f"Erro na análise de SNR: {e}")
            return 20.0
    
    def analyze_clipping(self, audio: np.ndarray) -> float:
        """
        Detecta clipping (distorção por sobrecarga).
        
        Returns:
            Percentual de amostras clipping (0-1)
        """
        clipping_threshold = 0.99
        clipped = np.abs(audio) > clipping_threshold
        return float(np.mean(clipped))
    
    def analyze_spectral_properties(self, audio: np.ndarray) -> dict:
        """
        Analisa propriedades espectrais.
        
        Returns:
            Dict com propriedades espectrais
        """
        try:
            # Calcular espectrograma
            S = librosa.feature.melspectrogram(y=audio, sr=self.sr, n_mels=128)
            log_S = librosa.power_to_db(S, ref=np.max)
            
            # Calular centroide espectral
            spec_centroid = librosa.feature.spectral_centroid(y=audio, sr=self.sr)[0]
            
            return {
                'spectral_centroid_mean': float(np.mean(spec_centroid)),
                'spectral_centroid_std': float(np.std(spec_centroid)),
                'dynamic_range': float(np.max(log_S) - np.min(log_S)),
            }
        except Exception as e:
            logger.warning(f"Erro na análise espectral: {e}")
            return {}
    
    def get_difficulty_level(self, audio: np.ndarray) -> str:
        """
        Determina nível de dificuldade do áudio.
        
        Returns:
            'easy', 'medium' ou 'hard'
        """
        snr = self.analyze_snr(audio)
        clipping = self.analyze_clipping(audio)
        
        if snr < 10 or clipping > 0.05:
            return 'hard'
        elif snr < 15 or clipping > 0.02:
            return 'medium'
        else:
            return 'easy'
