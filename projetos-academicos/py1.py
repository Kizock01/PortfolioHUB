def exibir_menu():
    print("\n" + "="*30)
    print("  SISTEMA ACADÊMICO DE BIBLIOTECA  ")
    print("="*30)
    print("1. Cadastrar Novo Livro")
    print("2. Listar Livros Cadastrados")
    print("3. Buscar Livro por Título")
    print("4. Sair")
    print("="*30)

def sistema_principal():
    biblioteca = []
    
    while True:
        exibir_menu()
        opcao = input("Escolha uma opção (1-4): ")
        
        if opcao == "1":
            titulo = input("Digite o título do livro: ")
            autor = input("Digite o autor do livro: ")
            ano = input("Digite o ano de publicação: ")
            
            livro = {"titulo": titulo, "autor": autor, "ano": ano}
            biblioteca.append(livro)
            print(f"\n[Sucesso]: '{titulo}' cadastrado com sucesso!")
            
        elif opcao == "2":
            if not biblioteca:
                print("\n[Aviso]: Nenhum livro cadastrado no sistema.")
            else:
                print("\n--- LISTA DE LIVROS ---")
                for idx, livro in enumerate(biblioteca, 1):
                    print(f"{idx}. {livro['titulo']} - Autor: {livro['autor']} ({livro['ano']})")
                    
        elif opcao == "3":
            if not biblioteca:
                print("\n[Aviso]: A biblioteca está vazia.")
                continue
            busca = input("Digite o título ou parte dele para buscar: ").lower()
            encontrados = [l for l in biblioteca if busca in l['titulo'].lower()]
            
            if encontrados:
                print("\n--- RESULTADOS ENCONTRADOS ---")
                for livro in encontrados:
                    print(f"• {livro['titulo']} | Autor: {livro['autor']} | Ano: {livro['ano']}")
            else:
                print("\n[Erro]: Nenhum livro encontrado com esse termo.")
                
        elif opcao == "4":
            print("\nEncerrando o sistema de biblioteca. Até logo!")
            break
        else:
            print("\n[Erro]: Opção inválida! Tente novamente.")

if __name__ == "__main__":
    sistema_principal()