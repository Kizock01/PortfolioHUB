# 🎯 Guia Rápido - TranscribeAI

## ⚡ Iniciar em 5 Minutos

### Opção 1: Windows (Mais Fácil)

1. **Duplo clique em `start.bat`**
   - Abrirá automaticamente 2 janelas do terminal
   - Backend em localhost:8000
   - Frontend em localhost:3000

2. **Abra o navegador**
   - Acesse http://localhost:3000
   - Comece a usar!

### Opção 2: macOS/Linux

```bash
# Tornar script executável
chmod +x start.sh

# Executar
./start.sh
```

### Opção 3: Docker (Se instalado)

```bash
docker-compose up --build
```

---

## 📱 Como Usar

1. **Upload de Áudio**
   - Clique na área de upload
   - Selecione: MP3, WAV, OGG, M4A ou WebM

2. **Ou Grave ao Vivo**
   - Clique em "Gravar Áudio"
   - Fale para o microfone
   - Clique em "Parar Gravação"

3. **Transcrever**
   - Clique em "Transcrever Agora"
   - Aguarde o processamento (veja a barra de progresso)

4. **Salve/Compartilhe**
   - 📋 **Copiar**: Copia para área de transferência
   - 📥 **Baixar**: Como TXT ou RTF
   - 🔗 **Compartilhar**: Via sistemas nativos
   - 📜 **Histórico**: Acesse transcrições anteriores

---

## 🎨 Recursos

- ☀️/🌙 **Tema Claro/Escuro** - Botão no canto superior direito
- 📜 **Histórico** - Todas as transcrições salvas localmente
- ✏️ **Editar** - Ajuste o texto manualmente
- 🎚️ **Controles de Áudio** - Player integrado
- 📊 **Barra de Progresso** - Visualize o processamento

---

## 🆘 Problemas Comuns

### "Erro de conexão com backend"
```bash
# Verificar se backend está rodando
curl http://localhost:8000/api/health

# Se não responder, inicie manualmente:
cd backend
python main.py
```

### "Microfone não funciona"
- ✅ Verifique as permissões do navegador
- ✅ Use HTTPS em produção
- ✅ Teste em outro navegador

### "Transcrição muito lenta"
- Edite `backend/main.py`
- Altere `WhisperModel("base"` para `"tiny"` (mais rápido)
- Ou use GPU se disponível

### "Arquivo WebM não suporta"
- Instale FFmpeg em seu sistema
- Ou use outro formato: MP3, WAV, OGG, M4A

---

## 📞 Próximos Passos

1. Customize o design em `frontend/tailwind.config.js`
2. Altere o modelo Whisper em `backend/main.py`
3. Configure ambiente de produção
4. Deploy na nuvem (Heroku, Railway, Vercel)

---

**Aproveite! 🚀**
