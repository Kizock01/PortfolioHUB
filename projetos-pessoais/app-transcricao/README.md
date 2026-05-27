# app-transcricao

Projeto focado na versao web.

Estrutura principal:

- `web/`: frontend + backend da aplicacao web
- `shared/`: codigo compartilhado
- `docs/`: documentacao
- `scripts/`: scripts auxiliares e historico

## Iniciar app web

Clique em `web/iniciar-web.bat`.

Esse script inicia backend e frontend em segundo plano e abre:

- `http://localhost:3000`

Health check do backend:

- `http://localhost:8000/health`

## Parar app web

Clique em `web/parar-web.bat`.

Ele encerra apenas os processos iniciados pelo app via PID salvo em `web/.runtime/`.
