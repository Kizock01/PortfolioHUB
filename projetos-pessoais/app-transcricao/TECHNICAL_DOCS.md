# TranscribeAI v2.0 - Documentação Técnica Completa

## 📋 Índice
1. [Arquitetura Geral](#arquitetura-geral)
2. [Frontend Refatorado](#frontend-refatorado)
3. [Backend Profissional](#backend-profissional)
4. [Pipeline de Processamento de Áudio](#pipeline-de-processamento)
5. [Sistema de IA](#sistema-de-ia)
6. [Implementação Passo-a-Passo](#implementação)

---

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENTE (Navegador)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TranscriptionApp2.tsx (Next.js + React 18)             │  │
│  │  - Upload/Gravação de Áudio                             │  │
│  │  - Exibição de Transcrição                              │  │
│  │  - Histórico Local (Zustand Store)                      │  │
│  │  - Interface SaaS Premium (Tailwind + Framer Motion)   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST (FormData)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (FastAPI Backend)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  main.py (FastAPI Application)                          │  │
│  │  - Validação de arquivo                                 │  │
│  │  - Orquestração de pipeline                             │  │
│  │  - Gerenciamento de jobs                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│  ┌─────────────┬──────────┴──────────┬────────────────────┐   │
│  ▼             ▼                      ▼                    ▼   │
│ [Audio]  [Transcriber]  [Quality]  [Corrector]               │
│Processor (Faster-Whisper) Analyzer   (PT-BR)                  │
│                                                                │
│  Modelos & Dados:                                             │
│  • Faster-Whisper (base/small/large)                         │
│  • Silero VAD                                                 │
│  • noisereduce (librosa)                                      │
│  • Dicionário PT-BR contextual                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Refatorado

### Estrutura de Componentes

```
TranscriptionApp2.tsx (Principal)
├── ProgressBar
│   └── Barra de progresso animada (Framer Motion)
├── UploadZone
│   ├── Drag-drop intuitivo
│   ├── Validação de arquivo
│   └── Feedback visual (isDragging state)
├── HistoryItemComponent (Repetível)
│   ├── Exibição compacta
│   ├── Menu de ações (Copiar/Baixar/Deletar)
│   └── Animações de expansão
└── TranscriptionApp (Container)
    ├── Header com branding
    ├── Layout Grid responsivo (1/4 cols)
    ├── Botões de ação (Upload/Gravação)
    └── Sidebar com Histórico
```

### State Management (Zustand)

```typescript
// store.ts - Estado global centralizado
interface AppStore {
  // Audio
  audioFile: File | null
  isRecording: boolean
  recordingTime: number
  
  // Transcrição
  transcription: string
  isProcessing: boolean
  progress: number
  
  // Histórico
  history: HistoryItem[]
  
  // Actions (16 métodos)
  setAudioFile
  setTranscription
  startRecording
  stopRecording
  addToHistory
  deleteHistoryItem
  clearHistory
  // ... mais
}
```

### Animações & Interações

- **ProgressBar**: Animação de largura em tempo real
- **UploadZone**: Escalas e muda cor ao arrastar
- **Botões**: Scale 1.05 on hover, 0.95 on tap
- **HistoryItems**: Fade in/out, expand animation
- **Transições**: Todas com Framer Motion + CSS transitions

### Responsividade

```css
/* Mobile-first approach */
@media (max-width: 640px)
  - Sidebar → Modal
  - Grid 1 coluna
  - Padding reduzido

@media (min-width: 1024px)
  - Grid 1/4 layout
  - Sidebar sticky
  - Full animations
```

---

## Backend Profissional

### Endpoints FastAPI

#### POST /transcribe
```
Entrada:
- file: UploadFile (audio)
- language: str = "pt"
- enhance_audio: bool = True
- difficulty_mode: bool = False

Processamento:
1. Salva arquivo temp
2. Carrega áudio
3. Analisa qualidade (SNR, clipping)
4. Processa áudio (se enhance_audio=True)
5. Detecta VAD (se difficulty_mode=True)
6. Transcreve (Faster-Whisper)
7. Aplica correção contextual
8. Retorna resultado

Saída:
{
  "job_id": "uuid",
  "text": "Transcrição...",
  "language": "pt",
  "duration": 45.5,
  "segments": [
    {"start": 0.0, "end": 5.2, "text": "...", "confidence": 0.95},
    ...
  ],
  "confidence": 0.92,
  "difficulty_level": "easy",
  "status": "completed"
}
```

#### GET /health
```
Status dos componentes:
- processor: bool
- transcriber: bool
- vad: bool
- quality_analyzer: bool
- cuda: bool
```

### Tratamento de Erros

```python
# global_exception_handler
- Todos erros 500 retornam {"detail": "Erro interno"}
- Logging estruturado com [job_id]
- Cleanup automático de arquivos temp
```

---

## Pipeline de Processamento

### 1. Audio Processor (`audio_processor.py`)

#### Métodos Principais

```python
class AudioProcessor:
    def load_audio(path: str) -> (ndarray, int)
    def reduce_noise(audio: ndarray) -> ndarray
    def normalize_loudness(audio: ndarray, target: float) -> ndarray
    def enhance_speech(audio: ndarray) -> ndarray
    def process_pipeline(audio, reduce_noise=True, ...) -> ndarray
    def save_audio(audio, path: str) -> None
```

#### Redução de Ruído
- Usa biblioteca `noisereduce`
- Detecta ruído na primeira 0.5s
- Aplica filtro estacionário

#### Normalização
- LUFS target: -20.0
- Calcula RMS, converte para dB
- Limita clipping (±1.0)

#### Realçação de Fala
- High-pass filter @ 80Hz (remove graves/ruído)
- Low-pass filter @ 8000Hz (remove altas frequências)
- Butterworth 4ª ordem

### 2. Voice Activity Detector (`audio_processor.py`)

```python
class VoiceActivityDetector:
    def detect_speech_segments(audio, threshold=0.5) -> list
    def extract_speech_segments(audio, segments, padding=0.1) -> ndarray
```

- Usa **Silero VAD** (modelo russo otimizado)
- Retorna lista de (start, end) para segmentos com voz
- Padding configurável para evitar cortar palavras

### 3. Quality Analyzer (`audio_processor.py`)

```python
class AudioQualityAnalyzer:
    def analyze_snr(audio) -> float          # Signal-to-Noise Ratio (dB)
    def analyze_clipping(audio) -> float     # % de clipping
    def analyze_spectral_properties(audio) -> dict
    def get_difficulty_level(audio) -> str   # 'easy'/'medium'/'hard'
```

**Decisão de Dificuldade:**
- `hard`: SNR < 10 ou clipping > 5%
- `medium`: SNR < 15 ou clipping > 2%
- `easy`: Resto

---

## Sistema de IA

### 1. AdvancedTranscriber (`transcriber.py`)

#### Modelo: Faster-Whisper
- **Base**: 140M params, boa qualidade/velocidade
- **Pode escalar**: small (244M), medium (769M), large (1.5B)
- **Device**: CUDA (GPU) com fallback para CPU

#### Parâmetros de Transcrição
```python
segments, info = model.transcribe(
    audio_path,
    language="pt",
    beam_size=10,           # 10 para hard, 5 para easy
    best_of=5,              # Múltiplas hipóteses
    patience=2.0,
    condition_on_previous_text=True,  # Context-aware
    initial_prompt="...",   # Dica para modelo
    temperature=0.2,        # Mais determinístico
)
```

#### Multi-pass Transcription
Para áudio muito difícil (difficulty_level="hard"):
1. Primeira passagem
2. Segunda passagem
3. Compara confiança
4. Retorna melhor resultado

### 2. PTBRContextCorrector (`transcriber.py`)

#### Correções Aplicadas
```python
# Linguagem informal
"vc" → "você"
"tbm" → "também"
"pra" → "para"
"tá" → "está"

# Erros comuns do Whisper
"transcrição" ← "transcricao" / "trascricao"
"português" ← "portugues" / "portugês"

# Reconstrução de frases incoerentes
Detecta padrões de confusão
Aplica filtragem de palavras raras
```

#### Pontuação Inteligente
- Adiciona ponto final se não existir
- Preserva maiúsculas e acentos

---

## Implementação Passo-a-Passo

### Fase 1: Frontend ✅ COMPLETO
- [x] Estrutura com Next.js 14
- [x] Tailwind CSS + Dark Mode
- [x] Zustand store centralizado
- [x] Componente TranscriptionApp2 refatorado
- [x] Framer Motion animações
- [x] Upload drag-drop + Gravação
- [x] Histórico com localStorage
- [x] Layout responsivo SaaS

### Fase 2: Backend ✅ COMPLETO
- [x] FastAPI com logging estruturado
- [x] Endpoints /transcribe, /health, /job
- [x] Validação de arquivo (tipos, tamanho)
- [x] Tratamento de erros global
- [x] CORS configurado
- [x] Documentação Swagger auto

### Fase 3: Audio Pipeline ✅ COMPLETO
- [x] AudioProcessor com redução de ruído
- [x] Normalização de loudness (LUFS)
- [x] Realçação de fala (filtros digitais)
- [x] VoiceActivityDetector (Silero VAD)
- [x] AudioQualityAnalyzer (SNR, clipping, spectral)
- [x] Modo de dificuldade automático

### Fase 4: IA Improvements ✅ COMPLETO
- [x] Faster-Whisper otimizado
- [x] Multi-pass transcription
- [x] Correção contextual PT-BR
- [x] Dicionário de abreviações
- [x] Initial prompt para contexto
- [x] Confidence scoring

### Fase 5: UI Polish 🔄 IN PROGRESS
- [ ] Tema visual refinado
- [ ] Componentes reutilizáveis
- [ ] Animações suaves
- [ ] Feedback visual completo
- [ ] Modo acessível
- [ ] Performance otimizada

---

## Performance & Otimizações

### Frontend
- Lazy loading de componentes
- Memoization com React.memo
- CSS modules para estilos isolados
- Code splitting automático (Next.js)

### Backend
- Async/await para I/O
- Processamento em paralelo (possível com workers)
- Caching de modelos em memória
- Cleanup automático de arquivos temp

### Áudio
- Carregamento eficiente com librosa
- Batch processing possível
- Progressão simulada no frontend

---

## Boas Práticas Implementadas

1. **Type Safety**: TypeScript strict em todo código
2. **Error Handling**: Try-catch em pontos críticos
3. **Logging**: Estruturado com contexto (job_id)
4. **Validation**: Frontend + Backend
5. **Security**: CORS, file type check, size limit
6. **Scalability**: Estado centralizado, componentes reutilizáveis
7. **Maintainability**: Código comentado, estrutura clara
8. **Performance**: Otimizações em múltiplas camadas

---

## Próximos Passos Recomendados

1. **Database**: PostgreSQL para histórico persistente
2. **Queue**: Redis para jobs assíncronos
3. **Cache**: Redis para modelos pré-carregados
4. **Monitoring**: Prometheus + Grafana
5. **Testing**: Jest (frontend), pytest (backend)
6. **CI/CD**: GitHub Actions
7. **Deployment**: Docker + Kubernetes

---

**TranscribeAI v2.0** - Pronto para Produção 🚀
