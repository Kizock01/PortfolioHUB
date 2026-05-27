# TranscribeAI v2.0 - Sistema de Transcrição Profissional com IA

Aplicativo completo de transcrição de áudio para texto usando IA avançada, otimizado especificamente para português brasileiro. Com pipeline de processamento de áudio robusto, interface moderna SaaS, e modelos de transcrição melhorados.

## 🌟 Características Principais

### Frontend
- ✅ **Interface SaaS Premium** - Design moderno, minimalista e profissional
- ✅ **Dark Mode Funcional** - Tema claro/escuro com transição suave
- ✅ **Layout Responsivo** - Funciona perfeitamente em mobile, tablet e desktop
- ✅ **Animações Fluidas** - Framer Motion para UX elegante
- ✅ **Upload & Gravação** - Drag-drop e gravação por microfone
- ✅ **Histórico Local** - Salva transcrições em localStorage
- ✅ **Edição de Texto** - Pode editar e corrigir transcrição
- ✅ **Exportação** - Copiar, baixar (TXT) e compartilhar

### Backend
- ✅ **FastAPI Profissional** - Backend robusto e escalável
- ✅ **Processamento de Áudio Avançado** - Redução de ruído, normalização, realçação
- ✅ **Voice Activity Detection (VAD)** - Detecção inteligente de voz
- ✅ **Faster-Whisper** - Modelo otimizado de transcrição
- ✅ **Multi-pass Transcription** - Para áudio difícil
- ✅ **Correção Contextual PT-BR** - Especializado para português brasileiro
- ✅ **Análise de Qualidade** - Detecta áudio difícil automaticamente
- ✅ **Logging Estruturado** - Rastreamento completo de processamento

### IA & Processamento
- ✅ **Redução Inteligente de Ruído** - Remove ruído de fundo
- ✅ **Normalização de Loudness** - Volume consistente
- ✅ **Realçação de Fala** - Filtros para clareza vocal
- ✅ **Detecção de VAD** - Silero VAD para segmentação
- ✅ **Análise SNR** - Calcula qualidade do áudio
- ✅ **Detecção de Clipping** - Identifica distorção
- ✅ **Modos de Dificuldade** - Easy, Medium, Hard

## 🛠️ Stack Tecnológico

### Frontend
```
- Next.js 14.2 (React 18)
- TypeScript 5.3
- Tailwind CSS 3.4
- Framer Motion 10.16
- Zustand 4.4 (State Management)
- Sonner 1.2 (Notifications)
- Lucide React (Icons)
- Next Themes (Dark Mode)
```

### Backend
```
- FastAPI 0.104
- Uvicorn (ASGI Server)
- Faster-Whisper 1.0
- Librosa 0.10 (Audio Processing)
- Soundfile 0.12
- Silero VAD 4.0
- noisereduce 3.0
- PyTorch 2.0
- NumPy, SciPy
```

## 📋 Pré-requisitos

- Node.js 18+ (Frontend)
- Python 3.9+ (Backend)
- 8GB RAM mínimo (recomendado 16GB)
- GPU CUDA opcional (para aceleração)

## 🚀 Instalação & Execução

### Setup Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env (opcional)
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

# Rodar desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

Frontend disponível em: `http://localhost:3000`

### Setup Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Copiar configuração de exemplo
cp .env.example .env

# Rodar servidor
python main.py

# Ou com uvicorn direto
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend disponível em: `http://localhost:8000`

Documentação API (Swagger): `http://localhost:8000/docs`

## 📁 Estrutura do Projeto

```
app-transcricao/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          # Layout global com ThemeProvider
│   │   ├── page.tsx            # Página principal
│   │   └── globals.css         # CSS global
│   ├── components/
│   │   ├── TranscriptionApp2.tsx    # App principal refatorada
│   │   ├── Button.tsx               # Botão reutilizável com CVA
│   │   ├── ThemeProvider.tsx        # Provider de tema
│   ├── store.ts                # Zustand store global
│   ├── utils.ts                # Funções auxiliares
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── main.py                 # Servidor FastAPI
│   ├── audio_processor.py      # Pipeline de processamento de áudio
│   ├── transcriber.py          # Lógica de transcrição com IA
│   ├── requirements.txt        # Dependências Python
│   └── .env.example            # Configuração de exemplo
│
├── docker-compose.yml          # Orquestração com Docker
├── README.md                   # Este arquivo
└── QUICK_START.md             # Guia rápido
```

## 🎯 Endpoints da API

### POST `/transcribe`
Transcreve arquivo de áudio

**Parâmetros:**
- `file` (multipart/form-data, required) - Arquivo de áudio
- `language` (string, default: "pt") - Código do idioma
- `enhance_audio` (boolean, default: true) - Processar áudio
- `difficulty_mode` (boolean, default: false) - Modo para áudio difícil

**Resposta:**
```json
{
  "job_id": "uuid",
  "text": "Texto transcrito...",
  "language": "pt",
  "duration": 45.5,
  "segments": [...],
  "confidence": 0.92,
  "difficulty_level": "easy",
  "status": "completed"
}
```

### GET `/`
Health check básico

### GET `/health`
Health check detalhado com status de componentes

### GET `/job/{job_id}`
Status de um trabalho de transcrição

### GET `/model/info`
Informações dos modelos carregados

## 🔧 Configuração

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```env
WHISPER_MODEL_SIZE=base          # tiny, base, small, medium, large
DEVICE=cpu                       # cuda ou cpu
PORT=8000
HOST=0.0.0.0
ENHANCE_AUDIO=true
LOG_LEVEL=INFO
```

## 📊 Fluxo de Processamento

```
1. Upload de arquivo
   ↓
2. Validação (tipo, tamanho)
   ↓
3. Análise de qualidade (SNR, clipping, spectral)
   ↓
4. Processamento de áudio
   - Redução de ruído
   - Realçação de fala
   - Normalização de loudness
   ↓
5. Voice Activity Detection (VAD)
   - Detectar segmentos de voz
   - Remover silêncios
   ↓
6. Transcrição (Faster-Whisper)
   - Pode usar multi-pass para áudio difícil
   ↓
7. Correção Contextual PT-BR
   - Ajustar linguagem informal
   - Corrigir erros comuns
   ↓
8. Resposta com texto transcrito
```

## 🎨 Design & UX

- **Color Scheme**: Indigo/Purple/Pink gradient
- **Typography**: Inter font, hierarchy clara
- **Dark Mode**: Automático baseado em preferência do sistema
- **Animações**: Framer Motion para transições suaves
- **Responsive**: Mobile-first, adapta para tablet/desktop
- **Accessibility**: Semântica HTML, labels, ARIA

## 🚀 Deploy

### Docker
```bash
docker-compose up -d
```

### Vercel (Frontend)
```bash
vercel deploy
```

### Railway/Heroku (Backend)
```bash
# Railway
railway up

# Heroku
git push heroku main
```

## 🐛 Troubleshooting

### CUDA não encontrado
```bash
# Usar CPU
export DEVICE=cpu
```

### Modelo Whisper não carrega
```bash
# Baixar manualmente
python -c "from faster_whisper import WhisperModel; WhisperModel('base')"
```

### Erro de permissão no microfone
- Verificar permissões no navegador
- Permitir acesso ao microfone

### Memória insuficiente
- Usar modelo menor: `tiny` ou `base`
- Ativar CPU mode ao invés de GPU

## 📈 Performance

- **Transcrição**: 1-2x tempo real (CPU), 0.2-0.5x (GPU)
- **Processamento de áudio**: ~50ms para 30s de áudio
- **Latência API**: ~100-200ms
- **Memória**: ~2GB (base model)

## 📝 Licença

MIT License - Veja LICENSE para detalhes

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- Issues: GitHub Issues
- Email: support@transcribeai.dev
- Documentação: https://transcribeai.dev/docs

## 🎓 Boas Práticas Implementadas

- ✅ **Componentização**: Componentes pequenos e reutilizáveis
- ✅ **State Management**: Zustand centralizado
- ✅ **Error Handling**: Try-catch em pontos críticos
- ✅ **Logging**: Logging estruturado no backend
- ✅ **Type Safety**: TypeScript em todo o código
- ✅ **Performance**: Lazy loading, memoization
- ✅ **Acessibilidade**: Semântica HTML, labels
- ✅ **Responsividade**: Mobile-first design
- ✅ **Clean Code**: Código limpo e bem comentado

---

**TranscribeAI v2.0** - Sistema de Transcrição Profissional 🚀
