# StudyQuest Alpha 1

Status: **Alpha 1**

StudyQuest e uma plataforma de estudos com camada RPG leve: progresso academico, quests, quiz por lotes e Arena X1 em modo alpha estavel.

## Funcionalidades

- Login/cadastro com Supabase Auth e fallback local.
- Persistencia por usuario de XP, gold, streak, materias e progresso.
- Onboarding academico salvo por usuario.
- Dashboard, perfil, quests e quiz.
- Arena X1 mock-only, sem API externa, com timer, bot simples, sons leves e revanche.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth/SSR
- lucide-react

## Rodar Localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Para validar a alpha:

```bash
npm run lint
npm run build
npm audit
```

## Variaveis

Crie `.env.local` com base em `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

O app nao quebra sem essas variaveis; ele usa fallback local.

## Supabase

Os scripts ficam em `supabase/`:

- `supabase/schema.sql`
- `supabase/seed.sql`
- `supabase/README.md`

O schema usa RLS e policies com `auth.uid()`. Nunca use `service_role` no frontend.

## Seguranca Alpha

- Senhas do fallback local usam hash + salt via Web Crypto API.
- `.env.local` e logs ficam fora do Git.
- Headers basicos de seguranca e CSP leve configurados em `next.config.ts`.
- Questoes e textos externos sao renderizados como texto/atributos React, sem `dangerouslySetInnerHTML`.
- O fallback local e uma conveniencia de alpha, nao substitui autenticacao real em producao.

## Performance

- Turbopack desativado no dev script.
- Arena carrega no maximo 10 questoes mockadas.
- Quiz usa lotes de 15 questoes.
- ENEM via API busca paginas pequenas por `limit/offset`, sem carregar anos completos.
- Sem particulas, canvas pesado ou animacoes infinitas.

## Roadmap

- Multiplayer real da Arena com Supabase Realtime ou WebSocket.
- Sincronizacao remota completa de progresso.
- Mais provedores de questoes com cache controlado.
- Testes automatizados dedicados para fluxos criticos.
