# Verificação da atualização do portfólio

Data: 06/09/2026. Branch: `codex/atualizar-portfolio`. Base: `4a7155c`.
Escopo rastreado em [E01 / #1](https://github.com/Kizock01/PortfolioHUB/issues/1) e [slice #2](https://github.com/Kizock01/PortfolioHUB/issues/2).

## Escopo e critérios

Conferir apresentação, formações, competências, autoria e descrições dos projetos, contatos, navegação e layout do site estático. Validar o prefixo `/PortfolioHUB/`, leitura em telas pequenas e grandes, teclado, contraste, movimento reduzido e carregamento sem dependências opcionais.

As aplicações de StudyQuest, transcrição e exercícios não foram alteradas. Seus backends, autenticação, bancos e builds estão fora desta manutenção da apresentação. A raiz não tem `package.json`, CI ou comando de build: o artefato publicável é o próprio HTML com os assets.

## Conteúdo e links

- Briefing do titular confrontado com a página e o README, incluindo as três formações em andamento, competências e disponibilidade.
- [Fonte oficial da residência](https://lablivre.unb.br/ResidenciaIA/) consultada para confirmar instituição, parceria, modalidade prática presencial, mentoria e áreas de estudo. Não foram atribuídas datas, ferramentas específicas ou entregas concluídas ao titular.
- Descrições dos quatro projetos confrontadas com o código. StudyQuest é um projeto de estudos em desenvolvimento; a arena usa bot e questões simuladas. TranscribeAI tem transcrição com faster-whisper e exportação TXT; não se promete limpeza de áudio não implementada. A normalização dos exercícios Python não é apresentada como embeddings. Adivinha Senha recebe crédito de origem para gbonatti.
- Página pública, perfil GitHub, quatro diretórios de código e repositório original de gbonatti responderam HTTP 200.
- LinkedIn preservado exatamente conforme briefing. A consulta automática recebeu HTTP 403; isso não permite concluir indisponibilidade do perfil. E-mail usa `mailto:`.
- O anexo contém apenas o briefing. O PDF existente no repositório é um plano de implantação, não um currículo; não foi criado botão de currículo.

## Execução no navegador

Verificação concluída com Playwright e axe-core, usando Chromium 148.0.7778.96. O servidor de teste manteve o prefixo `/PortfolioHUB/` e serviu apenas a página e seus assets. Os scripts de teste e dependências ficaram no ambiente temporário de QA, sem adicionar um framework ao repositório.

| Cenário | Resultado |
| --- | --- |
| Larguras de 1440, 768, 414, 390 e 320 px | Página renderizada sem rolagem horizontal; largura do documento igual à viewport. |
| Acessibilidade automatizada WCAG A/AA e boas práticas | Zero violações detectadas em todas as larguras; 32 regras aprovadas por execução. |
| Navegação por teclado | Primeiro foco no link de pular para o conteúdo; ativação leva ao conteúdo e o próximo Tab alcança o primeiro link da seção principal. |
| Texto ampliado a 200% em viewport de 1280 px | Sem rolagem horizontal. |
| Preferência por movimento reduzido | Rolagem suave desativada; conteúdo visível. |
| JavaScript desativado e fontes externas bloqueadas, 390 px | Conteúdo e 20 links disponíveis, sem rolagem horizontal. A versão final não depende de JavaScript nem de fontes externas. |
| Semântica e referências | Um `h1`, um `main`, idioma `pt-BR`, zero IDs duplicados, zero âncoras sem destino e `figcaption` em posição válida. |
| Arquivos locais, imagens e console | Recursos locais com HTTP 200, nenhuma imagem quebrada, nenhum erro de página ou requisição. |
| Revisão visual | Capturas completas em desktop e celular, abertura em tamanho real e seção de formação revisadas. |

O axe deixou a análise de alguns símbolos decorativos (setas e ícones) como incompleta por conterem apenas caracteres não textuais. Esses itens foram inspecionados visualmente e estão ocultos das tecnologias assistivas; não são violações de texto pendentes. A avaliação automática não substitui uma auditoria completa com leitores de tela.

Defeitos encontrados e corrigidos: posição do `figcaption`, contraste da numeração do diagrama de estudo (4,28:1 inicialmente) e dos índices na arte Python (4,08:1 inicialmente). A execução final repetiu os cenários após as correções. O menu recebeu letras maiores nas telas pequenas.

Evidências locais entregues na sessão: `portfolio-desktop.png`, `portfolio-mobile.png`, `portfolio-preview.png`, `portfolio-mobile-preview.png` e `portfolio-verification.json`.

`git diff --check` passou. Nenhuma diferença foi introduzida nos projetos internos, scripts anteriores ou `.gitignore` em relação à base `4a7155c`.

## Publicação

A configuração de GitHub Pages e os projetos internos foram preservados. As alterações desta entrega ainda são locais; publicação e verificação da versão nova no endereço público dependem do envio à branch configurada no Pages.
