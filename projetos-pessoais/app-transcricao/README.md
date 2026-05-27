# 🎙️ TranscribeAI - Transcrição de Áudio com IA

> 🚀 **TranscribeAI v2.0 DISPONÍVEL** - Reconstrução completa com interface SaaS, backend profissional e IA otimizada para português brasileiro. [Ver detalhes](./README_v2.md)

Um aplicativo moderno e profissional de transcrição de áudio para texto usando Inteligência Artificial (OpenAI Whisper).

## ✨ Características

- ✅ **Interface Moderna e Responsiva** - Design clean e intuitivo com suporte a tema claro/escuro
- ✅ **Gravação ao Vivo** - Grave áudio diretamente pelo microfone
- ✅ **Upload de Arquivos** - Suporta MP3, WAV, OGG, M4A e WebM
- ✅ **Transcrição em Tempo Real** - Indicador de progresso durante processamento
- ✅ **Histórico Local** - Salve suas transcrições no navegador
- ✅ **Múltiplas Opções de Export** - Baixe como TXT ou RTF
- ✅ **Compartilhamento** - Compartilhe suas transcrições facilmente
- ✅ **Edição Manual** - Edite o texto transcrito conforme necessário
- ✅ **Detecção de Idioma** - Detecta automaticamente o idioma (suporta português-BR)
- ✅ **Mobile First** - Funciona perfeitamente em PC e celular

## 🚀 Como Executar Localmente

### Pré-requisitos

- **Node.js** v18+ e npm
- **Python** 3.8+
- **FFmpeg** (opcional, para melhor suporte a formatos de áudio)

### 1. Clonar o Repositório

```bash
cd app-transcricao
```

### 2. Configurar o Backend (Python)

```bash
# Entrar no diretório backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
python main.py
```

O backend estará disponível em **http://localhost:8000**

> 💡 Acesse http://localhost:8000/docs para ver a documentação interativa da API

### 3. Configurar o Frontend (React/Next.js)

Em outro terminal:

```bash
# Entrar no diretório frontend
cd frontend

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

O frontend estará disponível em **http://localhost:3000**

### 4. Usar o Aplicativo

1. Abra http://localhost:3000 no navegador
2. Escolha entre:
   - **Upload de Arquivo**: Selecione um arquivo de áudio
   - **Gravação ao Vivo**: Clique em "Gravar Áudio" para gravar
3. Clique em **"Transcrever Agora"**
4. Aguarde o processamento (veja o progresso)
5. Use as opções para:
   - Copiar texto
   - Baixar como TXT ou RTF
   - Compartilhar
   - Visualizar histórico

## 📁 Estrutura do Projeto

```
app-transcricao/
├── frontend/                 # Aplicação React/Next.js
│   ├── app/
│   │   ├── layout.tsx       # Layout principal
│   │   ├── page.tsx         # Página inicial
│   │   └── globals.css      # Estilos globais
│   ├── components/
│   │   └── TranscriptionApp.tsx  # Componente principal
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── next.config.js
│
├── backend/                  # API FastAPI
│   ├── main.py             # Servidor FastAPI
│   ├── requirements.txt     # Dependências Python
│   └── venv/               # Ambiente virtual (criado após instalação)
│
└── README.md
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca UI
- **Next.js 14** - Framework React
- **Tailwind CSS** - Estilização
- **TypeScript** - Tipagem estática
- **Lucide React** - Ícones
- **Axios** - Requisições HTTP

### Backend
- **FastAPI** - Framework web moderno
- **Faster-Whisper** - Engine de transcrição otimizado
- **Python 3.8+** - Linguagem

## 🔧 Configuração em Produção

### Environment Variables

Crie um arquivo `.env` no backend:

```
WHISPER_MODEL=base
DEVICE=cpu
COMPUTE_TYPE=int8
```

### Opções de Modelo Whisper

- `tiny` - Mais rápido, menos preciso (~39M)
- `base` - Equilíbrio (padrão, ~140M)
- `small` - Mais preciso (~466M)
- `medium` - Muito preciso (~1.5G)

### Buildando para Produção

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

**Backend:**
```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

## 📊 API Endpoints

### POST /api/transcribe
Transcreve um arquivo de áudio

**Request:**
```
Content-Type: multipart/form-data
{
  "file": <audio_file>
}
```

**Response:**
```json
{
  "success": true,
  "language": "pt",
  "language_probability": 0.95,
  "text": "Sua transcrição aqui...",
  "duration": 120.5
}
```

### GET /api/health
Verifica status da API

**Response:**
```json
{
  "status": "healthy",
  "model": "whisper-base",
  "temp_dir": "temp_audio"
}
```

### GET /
Informações da API

## 📱 Formatos Suportados

- ✅ MP3
- ✅ WAV
- ✅ OGG
- ✅ M4A
- ✅ WebM

## 🎨 Customização

### Tema
O tema é salvo automaticamente no localStorage. Clique no botão de tema (🌙/☀️) para alternar.

### Cores
Edite o `tailwind.config.js` para personalizar as cores:

```js
colors: {
  primary: '#6366f1',   // Indigo
  secondary: '#8b5cf6', // Roxo
}
```

### Modelo Whisper
Edite `backend/main.py`:

```python
model = WhisperModel("small", device="cpu", compute_type="int8")
```

## 🐛 Troubleshooting

### Erro: "Não foi possível acessar o microfone"
- Verifique as permissões do navegador
- Use HTTPS em produção (requisito para acesso a microfone)

### Erro: "Backend não está rodando"
- Verifique se http://localhost:8000 está respondendo
- Reinicie o servidor backend
- Verifique a porta 8000

### Transcrição muito lenta
- Use um modelo menor: `tiny` ou `base`
- Utilize GPU se disponível: altere `device="cuda"` no backend
- Aumente `compute_type` para `float16` ou `float32`

### Erro com WebM no Windows
- Instale FFmpeg: https://ffmpeg.org/download.html
- Ou use formato WAV

## 📈 Melhorias Futuras

- [ ] Suporte a múltiplos idiomas
- [ ] Resumo automático com IA
- [ ] Identificação de falantes (speaker diarization)
- [ ] Edição colaborativa em tempo real
- [ ] Integração com Google Drive/Dropbox
- [ ] API de autenticação
- [ ] Dashboard de uso
- [ ] Suporte a legendas (SRT/VTT)

## 📝 Licença

Este projeto é fornecido como está para uso educacional e comercial.

## 👨‍💻 Desenvolvido por

TranscribeAI - Desenvolvido com ❤️

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Consulte a documentação da API em http://localhost:8000/docs
3. Verifique o troubleshooting acima

---

**Aproveite sua experiência com o TranscribeAI! 🎙️✨**
