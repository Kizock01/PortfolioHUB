# Estrutura e manutenção

- `index.html` é a entrada do portfólio público. Arquivos visuais da página ficam em `assets/` quando separados do HTML.
- O endereço público é [PortfolioHUB](https://kizock01.github.io/PortfolioHUB/). Caminhos locais relativos preservam o funcionamento no prefixo `/PortfolioHUB/` do GitHub Pages.
- A raiz não contém `package.json` nem etapa de build da página. Sua validação consiste em servir os arquivos estáticos, conferir referências e navegação e inspecionar o resultado em celular e computador, incluindo foco visível por teclado.
- `projetos-academicos/` contém `adivinha-senha/` e `exercicios-python/`. O primeiro foi importado via Git subtree e conserva estrutura e histórico próprios.
- `projetos-pessoais/` contém o aplicativo de transcrição e o StudyQuest. Seus manifestos, dependências, comandos e instruções pertencem a essas aplicações e não ao deploy estático da raiz.
- `documentacao/` contém material anterior do repositório. `docs/agents/` descreve somente as convenções de manutenção da apresentação.

A entrega E01 mantém a configuração existente de publicação. Não há decisão arquitetural nova que exija ADR. O [glossário](../../CONTEXT.md) registra termos do domínio; os requisitos e o progresso ficam nas [Issues](https://github.com/Kizock01/PortfolioHUB/issues).
