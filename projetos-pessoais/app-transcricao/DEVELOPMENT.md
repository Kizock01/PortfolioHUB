# 🚀 Guia de Desenvolvimento Local - TranscribeAI v2.0

## ⚡ Quick Setup (5 minutos)

### Windows
```batch
REM 1. Abra PowerShell/CMD
cd app-transcricao
quick-start.bat

REM Escolha a opção 4 (Ambos em janelas separadas)
```

### Linux/Mac
```bash
cd app-transcricao
chmod +x quick-start.sh
./quick-start.sh

# Escolha opção 1 (Ambos)
```

---

## 📋 Setup Detalhado

### Frontend Setup

```bash
cd frontend

# 1. Instalar Node 18+
node --version  # v18+
npm --version   # 9+

# 2. Instalar dependências
npm install

# 3. Variáveis de ambiente (.env.local)
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

# 4. Iniciar servidor de desenvolvimento
npm run dev

# 5. Abrir navegador
# http://localhost:3000
```

**Comandos Úteis:**
```bash
npm run dev           # Desenvolvimento (hot reload)
npm run build         # Build para produção
npm start            # Rodar build
npm run lint         # Verificar erros
npm run type-check   # TypeScript check
```

### Backend Setup

```bash
cd backend

# 1. Verificar Python 3.9+
python --version
python -m venv venv

# 2. Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configuração (opcional)
cp .env.example .env

# 5. Iniciar servidor
python main.py

# 6. Abrir documentação API
# http://localhost:8000/docs
# http://localhost:8000/redoc
```

**Primeira execução pode levar +5min** (baixa modelo Whisper ~140MB)

**Comandos Úteis:**
```bash
# Com reload automático
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Verificar health
curl http://localhost:8000/health

# Ver logs detalhados
python main.py  # Já mostra logs INFO
```

---

## 🔧 Troubleshooting

### Frontend

**Erro: "Cannot find module 'next-themes'"**
```bash
npm install next-themes
```

**Erro: "NEXT_PUBLIC_API_URL não definido"**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Porta 3000 já em uso**
```bash
npm run dev -- -p 3001
# ou
lsof -i :3000  # Encontrar e matar processo
kill -9 <PID>
```

### Backend

**Erro: "No module named 'faster_whisper'"**
```bash
pip install faster-whisper
# Pode levar tempo, deixar rodar
```

**Erro: "torch not installed"**
```bash
pip install torch torchaudio
# Se tiver GPU (CUDA):
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

**Erro: "Silero VAD model not found"**
```bash
# Baixar model da primeira vez
python -c "import torch; torch.hub.load('snakers4/silero-vad', 'silero_vad')"
```

**Porta 8000 já em uso**
```bash
python main.py --port 8001
# ou matar processo
lsof -i :8000
kill -9 <PID>
```

**CUDA not found (GPU)**
```bash
# Usar CPU
export DEVICE=cpu
python main.py
```

---

## 🧪 Testando Localmente

### Frontend

1. Abrir http://localhost:3000
2. Testar upload:
   - Arrastar arquivo de áudio
   - Verificar validação
   - Aguardar transcrição

3. Testar gravação:
   - Clicar "Gravar"
   - Falar algo
   - Clicar "Parar"
   - Verificar transcrição

4. Testar histórico:
   - Adicionar múltiplas transcrições
   - Verificar histórico na sidebar
   - Copiar/Baixar/Deletar

5. Testar dark mode:
   - Sistema (prefers-color-scheme)
   - Manual (próximos passos)

### Backend

**Health check:**
```bash
curl http://localhost:8000/health
# Resposta:
# {
#   "status": "healthy",
#   "components": {
#     "processor": true,
#     "transcriber": true,
#     "vad": true,
#     "quality_analyzer": true,
#     "cuda": false
#   }
# }
```

**Transcrever arquivo:**
```bash
# Preparar arquivo de teste
curl -X POST http://localhost:8000/transcribe \
  -F "file=@audio.mp3" \
  -F "language=pt" \
  -F "enhance_audio=true"
```

**Documentação interativa:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📊 Monitoramento em Desenvolvimento

### Logs do Backend
```
[INFO] Inicializando backend...
[INFO] ✓ AudioProcessor inicializado
[INFO] ✓ AdvancedTranscriber inicializado (device: cpu)
[INFO] ✓ VoiceActivityDetector inicializado
[INFO] ✓ AudioQualityAnalyzer inicializado
[INFO] ✅ Backend inicializado com sucesso!

[job_id] Arquivo salvo: /tmp/...
[job_id] Carregando áudio...
[job_id] Analisando qualidade...
[job_id] Processando áudio...
[job_id] Iniciando transcrição...
[job_id] Transcrição concluída
[job_id] ✓ Sucesso
```

### DevTools do Frontend
1. F12 → Console
2. Verificar erros/warnings
3. Network tab para requisições
4. Performance tab

### React DevTools
```bash
npm install -g @react-devtools/shell
react-devtools
```

---

## 🎯 Fluxo de Desenvolvimento

### Adicionar Feature

1. **Frontend**
   - Criar componente em `/components`
   - Usar Zustand para estado global
   - Adicionar teste se complexo

2. **Backend**
   - Adicionar endpoint em `main.py`
   - Adicionar logica em módulo apropriado
   - Testar com curl/Postman

3. **Integração**
   - Conectar frontend ao novo endpoint
   - Testar E2E localmente
   - Verificar logs

### Exemplo: Adicionar Summarization

**Backend (`transcriber.py`):**
```python
def summarize_text(text: str, max_length: int = 150) -> str:
    # Lógica de summarização
    pass
```

**Backend (`main.py`):**
```python
@app.post("/summarize")
async def summarize(text: str, max_length: int = 150):
    return {"summary": summarize_text(text, max_length)}
```

**Frontend (`TranscriptionApp2.tsx`):**
```typescript
const handleSummarize = async () => {
  const response = await fetch(`${apiUrl}/summarize`, {
    method: "POST",
    body: JSON.stringify({ text: transcription }),
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  setSummary(data.summary);
};
```

---

## 🔍 Debugging

### Frontend Debugging

**React Strict Mode:**
- Duplo render proposital para detectar side effects
- Verificar console para warnings

**Performance:**
```bash
npm run build
npm start
# Medir Core Web Vitals
```

### Backend Debugging

**Print debugging:**
```python
logger.info(f"Debug: {variable}")
```

**Breakpoints (VSCode):**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/main.py",
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 📦 Dependências Importantes

### Frontend
- **Next.js**: Framework React otimizado
- **Zustand**: State management minimalista
- **Framer Motion**: Animações fluidas
- **Tailwind**: CSS utility-first
- **Sonner**: Toast notifications
- **Lucide React**: Ícones SVG

### Backend
- **FastAPI**: Web framework rápido
- **Faster-Whisper**: Modelo de transcrição otimizado
- **Librosa**: Processamento de áudio
- **noisereduce**: Redução de ruído
- **Silero VAD**: Voice activity detection
- **PyTorch**: Deep learning framework

---

## 💾 Salvando Dados em Desenvolvimento

### LocalStorage (Frontend)
```typescript
// Automático via Zustand
// Histórico persistente entre reloads
```

### Arquivo Temporário (Backend)
```bash
# Removido automaticamente após processamento
# Ver /tmp (Linux) ou %TEMP% (Windows)
```

### Banco de Dados (Futuro)
```python
# Por implementar: PostgreSQL
# Por agora: Em-memória
```

---

## 🚀 Preparando para Produção

### Frontend
```bash
npm run build
npm run start

# Verificar build size
npm ls
```

### Backend
```python
# Remover reload=True
uvicorn main:app --host 0.0.0.0 --port 8000

# Usar gunicorn em produção
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Docker
```bash
docker-compose up -d
# Verifica:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
```

---

## 📚 Recursos Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Whisper Models](https://github.com/openai/whisper)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)

---

**Pronto para desenvolver!** 🎉

Dúvidas? Verifique logs e documentação.
