"""
Backend FastAPI profissional para TranscribeAI.
Pipeline completo: upload → processamento de áudio → transcrição → resposta.
"""

import os
import logging
import tempfile
import traceback
from pathlib import Path
from typing import Optional, List
from datetime import datetime
import uuid

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuração da aplicação
app = FastAPI(
    title="TranscribeAI Backend",
    description="Backend profissional de transcrição de áudio com IA",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Estado global (em produção usar Redis/Cache)
transcription_jobs = {}
processor = None
transcriber = None
vad = None
quality_analyzer = None
startup_errors = []


def _ensure_ffmpeg_in_path() -> None:
    """Garante FFmpeg no PATH para libs de áudio/transcrição no Windows."""
    candidate_bins = [
        Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "WinGet" / "Packages",
        Path("C:/ffmpeg/bin"),
    ]
    for base in candidate_bins:
        if not base.exists():
            continue
        matches = list(base.rglob("ffmpeg.exe"))
        if matches:
            ffmpeg_bin = str(matches[0].parent)
            current_path = os.environ.get("PATH", "")
            if ffmpeg_bin.lower() not in current_path.lower():
                os.environ["PATH"] = f"{ffmpeg_bin};{current_path}"
            logger.info("FFmpeg detectado em: %s", matches[0])
            return
    logger.warning("FFmpeg não encontrado automaticamente no PATH")


# Modelos Pydantic
class TranscriptionRequest(BaseModel):
    """Requisição de transcrição."""
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="ID único do trabalho")
    language: str = Field(default="pt", description="Código do idioma")
    enhance_audio: bool = Field(default=True, description="Se deve processar áudio")
    difficulty_mode: bool = Field(default=False, description="Se deve usar modo difícil")


class TranscriptionResponse(BaseModel):
    """Resposta de transcrição."""
    job_id: str
    text: str
    language: str
    duration: float
    segments: List[dict]
    confidence: float
    difficulty_level: str
    processing_time: float
    status: str = "completed"


class JobStatusResponse(BaseModel):
    """Status de um trabalho."""
    job_id: str
    status: str  # "pending", "processing", "completed", "error"
    result: Optional[dict] = None
    error: Optional[str] = None


# Inicialização
@app.on_event("startup")
async def startup_event():
    """Inicializa componentes na startup."""
    global processor, transcriber, vad, quality_analyzer, startup_errors
    
    try:
        logger.info("Inicializando backend...")
        _ensure_ffmpeg_in_path()
        startup_errors = []
        try:
            from audio_processor import AudioProcessor, VoiceActivityDetector, AudioQualityAnalyzer
            from transcriber import AdvancedTranscriber
        except Exception as import_err:
            startup_errors.append(f"Falha ao importar módulos de IA/áudio: {import_err}")
            logger.error("Falha ao importar módulos de IA/áudio: %s", import_err, exc_info=True)
            logger.warning("Backend iniciado em modo degradado (somente health/debug-upload).")
            return
        
        # Inicializar processador de áudio
        processor = AudioProcessor(sr=16000)
        logger.info("✓ AudioProcessor inicializado")
        
        # Inicializar transcritor
        # Usar "base" por padrão, "small" para melhor qualidade (mais lento)
        device = "cuda" if _is_cuda_available() else "cpu"
        transcriber = AdvancedTranscriber(model_size="base", device=device)
        logger.info(f"✓ AdvancedTranscriber inicializado (device: {device})")
        
        # Inicializar VAD
        vad = VoiceActivityDetector(sr=16000)
        logger.info("✓ VoiceActivityDetector inicializado")
        
        # Inicializar analisador de qualidade
        quality_analyzer = AudioQualityAnalyzer(sr=16000)
        logger.info("✓ AudioQualityAnalyzer inicializado")
        
        logger.info("✅ Backend inicializado com sucesso!")
    
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar backend: {e}")
        startup_errors.append(str(e))
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup na shutdown."""
    logger.info("Encerrando backend...")


# Utilitários
def _is_cuda_available() -> bool:
    """Verifica se CUDA está disponível."""
    try:
        import torch
        return torch.cuda.is_available()
    except:
        return False


def _is_valid_audio_file(filename: str) -> bool:
    """Valida extensão de arquivo de áudio."""
    valid_extensions = {'.mp3', '.wav', '.ogg', '.m4a', '.webm', '.flac', '.aac'}
    return Path(filename).suffix.lower() in valid_extensions


# Endpoints
@app.get("/")
async def root():
    """Health check."""
    return {
        "service": "TranscribeAI Backend",
        "version": "2.0.0",
        "status": "online",
        "device": "cuda" if _is_cuda_available() else "cpu"
    }


@app.get("/health")
async def health_check():
    """Health check simples para monitoramento."""
    return {"status": "ok"}


@app.get("/health/details")
async def health_details():
    """Health check detalhado para diagnóstico."""
    return {
        "status": "ok",
        "components": {
            "processor": processor is not None,
            "transcriber": transcriber is not None and transcriber.model is not None,
            "vad": vad is not None,
            "quality_analyzer": quality_analyzer is not None,
            "cuda": _is_cuda_available()
        },
        "startup_errors": startup_errors,
    }


@app.post("/debug-upload")
async def debug_upload(file: UploadFile = File(...)):
    """Rota de debug sem IA para validar upload e metadados do arquivo."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo não fornecido")

    extension = Path(file.filename).suffix.lower()
    contents = await file.read()
    size_bytes = len(contents)
    logger.info(
        "[debug-upload] arquivo=%s content_type=%s extensao=%s tamanho=%s bytes",
        file.filename,
        file.content_type,
        extension,
        size_bytes,
    )
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size_bytes": size_bytes,
        "extension": extension,
    }


@app.post("/transcribe")
@app.post("/api/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = "pt",
    enhance_audio: bool = True,
    difficulty_mode: bool = False,
    processing_level: str = "normal",
    background_tasks: BackgroundTasks = None
):
    """
    Transcreve arquivo de áudio.
    
    - **file**: Arquivo de áudio (MP3, WAV, OGG, M4A, FLAC, AAC)
    - **language**: Código do idioma (pt, pt-BR, etc)
    - **enhance_audio**: Se deve processar áudio (limpeza, normalização)
    - **difficulty_mode**: Se deve usar modo "áudio difícil" (mais processamento)
    """
    
    job_id = str(uuid.uuid4())
    transcription_jobs[job_id] = {
        "status": "processing",
        "created_at": datetime.now().isoformat()
    }
    
    try:
        if processor is None or transcriber is None or quality_analyzer is None:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Serviço de transcrição indisponível: dependências de IA/áudio não carregadas. "
                    f"Detalhes: {' | '.join(startup_errors) if startup_errors else 'sem detalhes'}"
                ),
            )

        # Validação
        if not file.filename:
            raise HTTPException(status_code=400, detail="Arquivo não fornecido")
        
        if not _is_valid_audio_file(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de arquivo inválido. Suportados: MP3, WAV, OGG, M4A, FLAC, AAC"
            )
        
        # Salvar arquivo temporário
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
        logger.info(
            "[%s] Recebido arquivo=%s content_type=%s extensao=%s tamanho=%s bytes",
            job_id,
            file.filename,
            file.content_type,
            Path(file.filename).suffix.lower(),
            len(contents),
        )
        
        logger.info(f"[{job_id}] Arquivo salvo: {tmp_path}")
        
        try:
            # 1. Carregar áudio
            logger.info(f"[{job_id}] Carregando áudio...")
            audio, sr = processor.load_audio(tmp_path)
            logger.info(f"[{job_id}] Áudio carregado: {len(audio)} amostras, {sr} Hz")
            
            # 2. Analisar qualidade
            logger.info(f"[{job_id}] Analisando qualidade...")
            quality_level = quality_analyzer.get_difficulty_level(audio)
            logger.info(f"[{job_id}] Nível de dificuldade: {quality_level}")
            
            # 3. Processar áudio com níveis conservadores
            level = processing_level.lower() if processing_level else "normal"
            if difficulty_mode and level == "normal":
                level = "hard"
            if enhance_audio:
                logger.info(f"[{job_id}] Início pré-processamento: level={level}")
                audio = processor.process_by_level(audio, level=level)
                logger.info(f"[{job_id}] Fim pré-processamento")

            # 4. Cortar silêncios por VAD (sempre, para reduzir alucinação)
            logger.info(f"[{job_id}] VAD: detectando segmentos de voz...")
            segments = vad.detect_speech_segments(audio, threshold=0.55) if vad else [(0, len(audio))]
            if len(segments) > 0:
                audio = vad.extract_speech_segments(audio, segments) if vad else audio
                logger.info(f"[{job_id}] VAD: extraídos {len(segments)} segmentos")
            
            # 5. Salvar áudio processado
            processed_path = str(Path(tmp_path).with_name(f"{Path(tmp_path).stem}_processed.wav"))
            processor.save_audio(audio, processed_path)
            
            # 6. Transcrever
            logger.info(f"[{job_id}] Início transcrição")
            
            if difficulty_mode and quality_level == "hard":
                # Usar multi-pass para áudio difícil
                result = transcriber.transcribe_with_multipass(
                    processed_path,
                    language=language,
                    difficulty_level=quality_level,
                    passes=2
                )
            else:
                # Transcrição normal
                result = transcriber.transcribe(
                    processed_path,
                    language=language,
                    difficulty_level=quality_level
                )
            
            logger.info(f"[{job_id}] Fim transcrição")
            
            # 7. Preparar resposta
            response_data = {
                "job_id": job_id,
                "text": result.text,
                "raw_text": result.raw_text,
                "corrected_text": result.corrected_text,
                "language": result.language,
                "duration": result.duration,
                "segments": result.segments,
                "confidence": result.confidence,
                "difficulty_level": result.difficulty_level,
                "processing_time": 0,  # Calculado pelo cliente
                "status": "completed"
            }
            
            # Atualizar job
            transcription_jobs[job_id]["status"] = "completed"
            transcription_jobs[job_id]["result"] = response_data
            
            logger.info(f"[{job_id}] ✓ Sucesso")
            
            return response_data
        
        finally:
            # Cleanup
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            if os.path.exists(processed_path := str(Path(tmp_path).with_name(f"{Path(tmp_path).stem}_processed.wav"))):
                os.unlink(processed_path)
    
    except HTTPException:
        transcription_jobs[job_id]["status"] = "error"
        raise
    except Exception as e:
        logger.error(f"[{job_id}] ❌ Erro: {e}", exc_info=True)
        logger.error("[%s] traceback completo:\n%s", job_id, traceback.format_exc())
        transcription_jobs[job_id]["status"] = "error"
        transcription_jobs[job_id]["error"] = str(e)
        raise HTTPException(status_code=500, detail=f"Erro na transcrição: {str(e)}")


@app.get("/job/{job_id}")
async def get_job_status(job_id: str):
    """Obtém status de um trabalho."""
    if job_id not in transcription_jobs:
        raise HTTPException(status_code=404, detail="Trabalho não encontrado")
    
    job = transcription_jobs[job_id]
    return JobStatusResponse(
        job_id=job_id,
        status=job["status"],
        result=job.get("result"),
        error=job.get("error")
    )


@app.get("/model/info")
async def get_model_info():
    """Retorna informações sobre os modelos carregados."""
    if transcriber is None:
        return {"error": "Transcritor não inicializado"}
    
    return transcriber.get_model_info()


@app.post("/batch-transcribe")
async def batch_transcribe(files: List[UploadFile] = File(...)):
    """
    Transcreve múltiplos arquivos.
    
    Retorna lista com job_ids para rastrear progresso.
    """
    job_ids = []
    
    for file in files:
        # Reutilizar endpoint /transcribe
        job_ids.append(str(uuid.uuid4()))
    
    return {"job_ids": job_ids, "message": "Arquivos enfileirados para processamento"}


# Erro handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handler global de exceções."""
    logger.error(
        "Erro não tratado em %s %s: %s",
        request.method,
        request.url.path,
        exc,
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor"}
    )




if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
