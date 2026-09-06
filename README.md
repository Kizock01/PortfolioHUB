# Guilherme Bastos Moreira

Estudo Inteligência Artificial e desenvolvo aplicações para praticar o que aprendo sobre dados e software. Tenho interesse em tratamento e preparação de dados, IA generativa e automação. Busco estágios e oportunidades de entrada em TI, IA, dados e desenvolvimento.

Estou em Formosa/GO, com disponibilidade para Brasília/DF e oportunidades remotas ou híbridas.

[Portfólio](https://kizock01.github.io/PortfolioHUB/) · [GitHub](https://github.com/Kizock01) · [LinkedIn](https://linkedin.com/in/guilherme-bastos-0a87382aa) · [E-mail](mailto:gbastosmoreira@gmail.com)

## Formação em andamento

- **Residência em Inteligência Artificial — Brasília:** Instituto ELDORADO em parceria com a Universidade de Brasília (UnB), no Campus Gama. Formação presencial e prática em IA, machine learning e análise de dados, com apoio de mentores e proposta de aplicação a problemas reais. Meu foco de interesse é o tratamento e a preparação de dados: organizar, limpar e estruturar informações para apoiar análises e o desenvolvimento de aplicações de IA. [Programa oficial](https://lablivre.unb.br/ResidenciaIA/).
- **Bacharelado em Inteligência Artificial:** CEUB — Centro Universitário de Brasília, período noturno.
- **Técnico em Inteligência Artificial:** IFNMG — Instituto Federal do Norte de Minas Gerais, EAD.

## Conhecimentos e prática

- **Dados:** Python e pandas para tratar e preparar dados; conhecimentos em SQL para consultar e organizar informações.
- **Inteligência Artificial:** estudos e prática com IA generativa, RAG, LangChain, ChromaDB e Gemini API para explorar aplicações que consultam conteúdos e trabalham com linguagem. Fundamentos de processamento de linguagem natural.
- **Desenvolvimento:** Next.js, TypeScript e Tailwind CSS para interfaces web; Supabase e integração de APIs para conectar aplicações a dados e serviços.
- **Ferramentas e idioma:** Git e GitHub para versionamento; inglês avançado para leitura de documentação e estudo de materiais técnicos.

Esses conhecimentos não representam experiência profissional nem uso de todas as tecnologias em cada projeto ou na residência.

## Projetos

| Projeto | Contexto e implementação | Código |
| --- | --- | --- |
| **StudyQuest** | Projeto pessoal em desenvolvimento para organizar a prática de estudos. Aplicação com quizzes, missões e acompanhamento de progresso, usando Next.js, TypeScript, Tailwind CSS e Supabase. Há integração com questões do ENEM; a arena é treino contra bot com questões simuladas. | [StudyQuest](projetos-pessoais/StudyQuest/studyquest/) |
| **TranscribeAI** | Projeto pessoal para converter áudio em texto. Aplicação web com upload ou gravação pelo microfone, edição manual, histórico local e exportação TXT. Usa Python, FastAPI, faster-whisper, Next.js e TypeScript; requer seu próprio backend para funcionar. | [TranscribeAI](projetos-pessoais/app-transcricao/) |
| **Exercícios Python** | Atividades acadêmicas de cadastro e busca de livros, cálculo de receitas e despesas e normalização de textos com índices numéricos. Prática de funções, listas, dicionários e estruturas de controle em Python. | [Exercícios](projetos-academicos/exercicios-python/) |
| **Adivinha Senha** | Jogo de terminal em Python com senha aleatória, limite de tentativas e validação de palpites. Projeto de [gbonatti](https://github.com/gbonatti/adivinha-senha), incorporado a este repositório para estudo, com histórico preservado. | [Código incorporado](projetos-academicos/adivinha-senha/) |

Os projetos são pessoais ou acadêmicos. Os links levam ao código e às instruções de cada aplicação; não há demonstrações públicas específicas verificadas.

## Estrutura e manutenção do site

- `index.html`: página pública do portfólio.
- `assets/`: estilos e identidade visual da página.
- `projetos-academicos/` e `projetos-pessoais/`: projetos preservados, com instruções próprias.
- `documentacao/`: planos e materiais de apoio existentes.
- `docs/agents/`: contexto operacional para manutenção por agentes.

O site é HTML e CSS estáticos. **Não há etapa de build, `package.json` ou suíte de testes na raiz.** Os projetos Next.js dentro das subpastas têm seus próprios comandos e não são dependências da página pública.

Para conferir o mesmo prefixo do GitHub Pages, execute no diretório que contém `PortfolioHUB`:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8000/PortfolioHUB/`. Confira navegação por teclado, links, carregamento dos arquivos e layout em celular e computador. Ao alterar a página, use caminhos relativos para os assets, preservando o endereço `/PortfolioHUB/`.

A publicação continua no GitHub Pages, com a configuração existente do repositório. Depois da revisão, as alterações precisam chegar à branch configurada para publicação. Consulte a [verificação desta atualização](docs/qa/portfolio-refresh.md) para evidências e pendências.
