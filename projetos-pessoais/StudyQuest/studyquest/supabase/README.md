# Supabase Setup (StudyQuest)

## 1) Abrir o projeto no Supabase
1. Acesse `https://supabase.com/dashboard`.
2. Abra seu projeto.
3. No menu lateral, entre em `SQL Editor`.
4. Clique em `New query`.

## 2) Aplicar schema.sql
1. No projeto local, abra `supabase/schema.sql`.
2. Copie todo o conteudo.
3. Cole no `SQL Editor` do Supabase.
4. Clique em `Run`.

## 3) Aplicar seed.sql (opcional)
1. Clique novamente em `New query`.
2. Abra `supabase/seed.sql`.
3. Copie e cole no editor.
4. Clique em `Run`.

## 4) Variaveis de ambiente
Crie `.env.local` na raiz com:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## 5) Se o schema ainda nao existir
O app continua funcionando com fallback localStorage.
Na UI, pode aparecer:

`Sincronizacao online pendente.`
