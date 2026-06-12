import random


MENOR_SENHA = 1
MAIOR_SENHA = 100
MAX_TENTATIVAS = 7


def mostrar_intro():
    print("=== Adivinha Senha ===")
    print("Voce acordou dentro de uma sala digital trancada.")
    print("No painel da porta existe uma senha numerica escondida.")
    print("Descubra a senha correta para desbloquear a saida.")


def gerar_senha():
    return random.randint(MENOR_SENHA, MAIOR_SENHA)


def avaliar_palpite(palpite, senha_secreta):
    if palpite == senha_secreta:
        return "acertou"
    if palpite > senha_secreta:
        return "alto"
    return "baixo"


def mostrar_dica(resultado):
    if resultado == "acertou":
        print("Acertou! A porta foi desbloqueada.")
    elif resultado == "alto":
        print("Muito alto.")
    else:
        print("Muito baixo.")


def ler_palpite():
    while True:
        entrada = input("Digite sua tentativa: ").strip()

        if not entrada:
            print("Digite um numero.")
            continue

        try:
            palpite = int(entrada)
        except ValueError:
            print("Digite apenas numeros.")
            continue

        if palpite < MENOR_SENHA or palpite > MAIOR_SENHA:
            print(f"Digite um numero entre {MENOR_SENHA} e {MAIOR_SENHA}.")
            continue

        return palpite


def jogar():
    senha_secreta = gerar_senha()
    tentativas = 0
    acertou = False

    while not acertou and tentativas < MAX_TENTATIVAS:
        tentativa = ler_palpite()
        tentativas += 1
        resultado = avaliar_palpite(tentativa, senha_secreta)
        mostrar_dica(resultado)

        if resultado == "acertou":
            print(f"Voce precisou de {tentativas} tentativa(s).")
            acertou = True

    if not acertou:
        print("Suas tentativas acabaram. A porta continuou trancada.")
        print(f"A senha era {senha_secreta}.")


def main():
    mostrar_intro()
    print(f"A senha esta entre {MENOR_SENHA} e {MAIOR_SENHA}.")
    print(f"Voce tem {MAX_TENTATIVAS} tentativas.")
    jogar()


if __name__ == "__main__":
    main()
