# 🤝 Contribuindo para TranscribeAI

Obrigado por considerar contribuir! Este documento fornece diretrizes e instruções.

## 🚀 Como Começar

1. **Fork o repositório**
2. **Clone localmente**
   ```bash
   git clone https://github.com/seu-usuario/app-transcricao.git
   cd app-transcricao
   ```
3. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/minha-feature
   ```

## 📋 Antes de Começar

- Verifique se a issue já existe
- Discuta mudanças significativas em uma issue primeiro
- Siga o código existente

## 🛠️ Configuração de Desenvolvimento

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
npm run dev
```

## 📝 Padrões de Código

### Python (Backend)
- Use **PEP 8**
- Type hints quando possível
- Docstrings em funções
- Máximo 100 caracteres por linha

```python
def transcribe_audio(file: UploadFile = File(...)) -> dict:
    """Transcreve arquivo de áudio."""
    # Seu código aqui
    pass
```

### TypeScript/React (Frontend)
- Use **Prettier** para formatação
- Components funcionais com hooks
- Props tipadas
- Nomes descritivos

```typescript
interface TranscriptionRecord {
  id: string;
  text: string;
  timestamp: number;
}

export function TranscriptionApp() {
  // Seu código aqui
}
```

## 🧪 Testes

```bash
# Backend
pytest tests/

# Frontend
npm run test
```

## 📤 Enviando PR

1. **Commit com mensagens claras**
   ```bash
   git commit -m "feat: adiciona suporte a novo formato"
   ```

2. **Push para sua branch**
   ```bash
   git push origin feature/minha-feature
   ```

3. **Abra um Pull Request**
   - Descreva as mudanças
   - Referencie issues relacionadas
   - Adicione screenshots se aplicável

## 🐛 Reportando Bugs

Use issues com template:

```markdown
## Descrição
[Descreva o bug]

## Passos para Reproduzir
1. ...
2. ...

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que realmente acontece]

## Ambiente
- OS: [Windows/macOS/Linux]
- Browser: [Chrome/Firefox/Safari]
- Versão do Node: [X.Y.Z]
- Versão do Python: [X.Y.Z]
```

## 💡 Sugestões de Funcionalidades

Abra uma issue com:
- Título claro e descritivo
- Descrição detalhada do recurso
- Exemplos de uso
- Por que seria útil

## 📚 Estrutura do Projeto

```
app-transcricao/
├── frontend/                 # React/Next.js
│   ├── app/                 # Pages e layouts
│   ├── components/          # Componentes reutilizáveis
│   ├── styles/              # Estilos globais
│   └── public/              # Arquivos estáticos
├── backend/                  # FastAPI
│   ├── main.py              # Servidor
│   ├── routes/              # Endpoints da API
│   └── services/            # Lógica de negócio
└── docs/                     # Documentação
```

## 🎯 Áreas Para Contribuir

- [ ] Suporte a múltiplos idiomas
- [ ] Resumo automático com IA
- [ ] Speaker diarization
- [ ] Melhorar interface
- [ ] Adicionar testes
- [ ] Documentação
- [ ] Tradução

## 📖 Recursos Úteis

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Whisper Docs](https://github.com/openai/whisper)

## 🙏 Agradecimentos

Toda contribuição é valorizada! Obrigado por melhorar TranscribeAI.

---

**Dúvidas?** Abra uma issue ou entre em contato!
