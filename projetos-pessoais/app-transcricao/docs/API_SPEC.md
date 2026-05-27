# 🔌 Especificação da API TranscribeAI

## Base URL
```
http://localhost:8000
```

## Documentação Interativa
```
http://localhost:8000/docs (Swagger UI)
http://localhost:8000/redoc (ReDoc)
```

---

## 📡 Endpoints

### 1️⃣ POST /api/transcribe
Transcreve um arquivo de áudio em texto.

**Request**
```http
POST /api/transcribe HTTP/1.1
Content-Type: multipart/form-data

{
  "file": <binary_audio_file>
}
```

**Formatos Suportados**
- audio/mpeg (MP3)
- audio/wav (WAV)
- audio/ogg (OGG)
- audio/mp4 (M4A)
- audio/webm (WebM)

**Response (200 OK)**
```json
{
  "success": true,
  "language": "pt",
  "language_probability": 0.9563,
  "text": "Aqui está a transcrição do áudio.",
  "duration": 45.5
}
```

**Error Responses**
```json
{
  "detail": "Formato de arquivo não suportado. Use: mp3, wav, ogg, m4a, webm"
}
```

**Status Codes**
- `200` - Transcrição bem-sucedida
- `400` - Formato inválido
- `500` - Erro no processamento

---

### 2️⃣ GET /api/health
Verifica o status da API e do modelo.

**Request**
```http
GET /api/health HTTP/1.1
```

**Response (200 OK)**
```json
{
  "status": "healthy",
  "model": "whisper-base",
  "temp_dir": "temp_audio"
}
```

---

### 3️⃣ GET /
Informações gerais da API.

**Request**
```http
GET / HTTP/1.1
```

**Response (200 OK)**
```json
{
  "status": "online",
  "message": "API de Transcrição AI rodando",
  "version": "1.0.0"
}
```

---

## 🔐 Autenticação

Atualmente sem autenticação. Para produção, adicione:

```python
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.post("/api/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    credentials: HTTPAuthenticationCredentials = Depends(security)
):
    # Validar token
    pass
```

---

## 📊 Rate Limiting

Para implementar rate limiting:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/transcribe")
@limiter.limit("5/minute")
async def transcribe_audio(...):
    pass
```

---

## 🔍 Exemplos de Uso

### Python
```python
import requests

with open("audio.mp3", "rb") as f:
    files = {"file": f}
    response = requests.post(
        "http://localhost:8000/api/transcribe",
        files=files
    )
    print(response.json())
```

### JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append("file", audioFile);

const response = await fetch(
  "http://localhost:8000/api/transcribe",
  { method: "POST", body: formData }
);

const data = await response.json();
console.log(data.text);
```

### cURL
```bash
curl -X POST \
  -F "file=@audio.mp3" \
  http://localhost:8000/api/transcribe
```

---

## ⚙️ Configurações

### Variáveis de Ambiente
```
WHISPER_MODEL=base          # tiny, base, small, medium
DEVICE=cpu                  # cpu, cuda
COMPUTE_TYPE=int8           # int8, int16, float32, float16
CORS_ORIGINS=*              # URLs permitidas
MAX_FILE_SIZE=104857600     # 100MB em bytes
```

### Modelos Disponíveis

| Modelo | Velocidade | Precisão | Tamanho | Memória |
|--------|-----------|----------|--------|---------|
| tiny   | ⚡⚡⚡    | ⭐       | 39MB   | ~300MB  |
| base   | ⚡⚡     | ⭐⭐     | 140MB  | ~600MB  |
| small  | ⚡      | ⭐⭐⭐   | 466MB  | ~1.5GB  |
| medium | 🐢      | ⭐⭐⭐⭐  | 1.5GB  | ~4GB    |

---

## 🚨 Tratamento de Erros

Todos os erros retornam:
```json
{
  "detail": "Descrição do erro"
}
```

### Erros Comuns

| Código | Erro | Solução |
|--------|------|--------|
| 400 | Formato não suportado | Use MP3, WAV, OGG, M4A ou WebM |
| 413 | Arquivo muito grande | Máximo 100MB |
| 500 | Erro no processamento | Tente novamente ou reinicie servidor |
| 503 | Serviço indisponível | Servidor offline |

---

## 📈 Performance

### Otimizações
- Processamento assíncrono
- Cache de modelos
- Limite de tamanho de arquivo
- Limpeza automática de temp

### Benchmarks (CPU)
- Arquivo 5min: ~30-40s (tiny)
- Arquivo 5min: ~60-90s (base)
- Arquivo 5min: ~3-5min (small)

---

## 🔄 Webhooks (Futuro)

```python
@app.post("/api/transcribe-webhook")
async def transcribe_with_webhook(
    file: UploadFile,
    webhook_url: str
):
    # Processar assincronamente
    # Enviar resultado para webhook_url
    pass
```

---

## 📚 Versioning

API segue semântica de versionamento:
- `v1.0.0` - Versão atual
- Mudanças incompatíveis = versão maior
- Novos recursos = versão menor
- Correções = versão patch

---

## ✅ Checklist de Integração

- [ ] Endpoint `/api/transcribe` respondendo
- [ ] Formatos suportados funcionando
- [ ] Erro 400 para formato inválido
- [ ] Resposta em formato JSON correto
- [ ] CORS configurado
- [ ] Health check funcional
- [ ] Testes automatizados passando

---

## 🆘 Suporte

- Documentação: http://localhost:8000/docs
- Issues: GitHub Issues
- Discussões: GitHub Discussions
