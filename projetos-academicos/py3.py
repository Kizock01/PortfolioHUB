def processar_extrato_mensal(transacoes):
    print("\n=== PROCESSANDO LOG DE ENTRADAS E SAÍDAS ===")
    total_receitas = 0.0
    total_despesas = 0.0
    
    for descricao, valor in transacoes.items():
        # Lógica de decisão para segmentar fluxos financeiros
        if valor > 0:
            total_receitas += valor
            print(f"[+] Entrada Registrada: {descricao} -> +R$ {valor:.2f}")
        else:
            total_despesas += abs(valor)
            print(f"[-] Despesa Registrada: {descricao} -> -R$ {abs(valor):.2f}")
            
    saldo_final = total_receitas - total_despesas
    return total_receitas, total_despesas, saldo_final

if __name__ == "__main__":
    # Simulação de registros comuns extraídos de e-mails ou planilhas
    historico_mensal = {
        "Bolsa de Estudos / Estágio": 1200.00,
        "Plataforma de Fitness / Saúde": -110.00,
        "Alimentação / Delivery": -85.50,
        "Curso Técnico IFNMG Certificação": -45.00,
        "Venda de Equipamento Usado": 250.00
    }
    
    receitas, despesas, saldo = processar_extrato_mensal(historico_mensal)
    
    print("\n" + "="*35)
    print("        BALANÇO FINAL AUDITADO       ")
    print("="*35)
    print(f"Faturamento Total:   R$ {receitas:.2f}")
    print(f"Despesas Consolidadas: R$ {despesas:.2f}")
    print(f"Saldo Líquido Atual:  R$ {saldo:.2f}")
    
    if saldo >= 0:
        print("Status da Conta: Superavitário (Dentro da meta)")
    else:
        print("Status da Conta: Atenção! Déficit identificado")
    print("="*35)