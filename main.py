SENHA_SECRETA = 42


def mostrar_intro():
    print("=== Adivinha Senha ===")
    print("Voce acordou dentro de uma sala digital trancada.")
    print("No painel da porta existe uma senha numerica escondida.")
    print("Descubra a senha correta para desbloquear a saida.")


def main():
    mostrar_intro()
    tentativa = int(input("Digite sua tentativa: "))

    if tentativa == SENHA_SECRETA:
        print("Acertou! A porta foi desbloqueada.")
    elif tentativa > SENHA_SECRETA:
        print("Muito alto.")
    else:
        print("Muito baixo.")


if __name__ == "__main__":
    main()
