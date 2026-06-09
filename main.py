import random


MENOR_SENHA = 1
MAIOR_SENHA = 100


def mostrar_intro():
    print("=== Adivinha Senha ===")
    print("Voce acordou dentro de uma sala digital trancada.")
    print("No painel da porta existe uma senha numerica escondida.")
    print("Descubra a senha correta para desbloquear a saida.")


def main():
    mostrar_intro()
    print(f"A senha esta entre {MENOR_SENHA} e {MAIOR_SENHA}.")

    senha_secreta = random.randint(MENOR_SENHA, MAIOR_SENHA)
    tentativas = 0
    acertou = False

    while not acertou:
        tentativa = int(input("Digite sua tentativa: "))
        tentativas += 1

        if tentativa == senha_secreta:
            print("Acertou! A porta foi desbloqueada.")
            print(f"Voce precisou de {tentativas} tentativa(s).")
            acertou = True
        elif tentativa > senha_secreta:
            print("Muito alto.")
        else:
            print("Muito baixo.")


if __name__ == "__main__":
    main()
