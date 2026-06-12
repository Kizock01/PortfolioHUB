# Adivinha Senha

## Historia

Voce acorda dentro de uma sala digital trancada. A única saída e uma porta
protegida por uma senha numérica. Para escapar, o jogador precisa descobrir a
senha usando as dicas do sistema.

## Objetivo

Descobrir a senha correta e desbloquear a porta.

## Como executar

```bash
python main.py
```

## Como jogar

O jogo sorteia uma senha numerica entre 1 e 100. A cada tentativa, o sistema
informa se o palpite foi muito alto, muito baixo ou correto. O jogador tem 7
tentativas para desbloquear a porta.

Entradas inválidas, como textos ou numeros fora do intervalo, mostram uma
mensagem de aviso e não gastam tentativa.

## Exemplo de interacao

```text
=== Adivinha Senha ===
Voce acordou dentro de uma sala digital trancada.
No painel da porta existe uma senha numérica escondida.
Descubra a senha correta para desbloquear a saída.
A senha esta entre 1 e 100.
Voce tem 7 tentativas.
Digite sua tentativa: 50
Muito alto.
Digite sua tentativa: 25
Muito baixo.
Digite sua tentativa: 42
Acertou! A porta foi desbloqueada.
Voce precisou de 3 tentativa(s).
```

## Conceitos usados

- Entrada de dados
- Condicionais
- Laço de repetição
- Variáveis
- Funções
