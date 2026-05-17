def limpar_e_formatar_texto(lista_textos):
    """
    Simula uma etapa essencial de pipeline de IA: limpeza e normalização 
    de entradas brutas (removendo espaços extras e padronizando caixa).
    """
    print("\n[Pipeline]: Iniciando processo de Data Cleaning...")
    dados_limpos = []
    
    for item in lista_textos:
        # Tratamento de strings (Comum em engenharia de prompt e NLP)
        texto_tratado = item.strip().lower()
        if texto_tratado and len(texto_tratado) > 3:
            dados_limpos.append(texto_tratado)
            
    return dados_limpos

def simular_vetorizacao(dados_limpos):
    """
    Demonstra a conversão de categorias de texto em índices numéricos estruturados.
    """
    print("[Pipeline]: Vetorizando e indexando elementos tratados...")
    vocabulario = {}
    indices_finais = []
    
    for token in dados_limpos:
        if token not in vocabulario:
            vocabulario[token] = len(vocabulario) + 1
        indices_finais.append(vocabulario[token])
        
    return vocabulario, indices_finais

if __name__ == "__main__":
    # Exemplo de entrada com dados corrompidos/desformatados
    dados_academicos_brutos = [
        "  INTELIGENCIA ARTIFICIAL ",
        " python ",
        "   ",  # Entrada inválida/vazia
        "IA",   # Muito curto
        "Automação de Processos   "
    ]
    
    print("=== PIPELINE DE TRATAMENTO DE DADOS APLICADO ===")
    print(f"Dados Iniciais: {dados_academicos_brutos}")
    
    textos_limpos = limpar_e_formatar_texto(dados_academicos_brutos)
    print(f"Resultado da Limpeza: {textos_limpos}")
    
    dicionario, matriz_indices = simular_vetorizacao(textos_limpos)
    print(f"\nDicionário de Tokens Criado: {dicionario}")
    print(f"Vetor Numérico Final para Modelos: {matriz_indices}")