#!/bin/bash
# quick-start.sh - Script para iniciar TranscribeAI rapidamente

set -e

echo "🚀 TranscribeAI v2.0 - Iniciador Rápido"
echo "========================================"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Função para imprimir seções
print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Verificar se está no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Execute este script a partir da raiz do projeto${NC}"
    exit 1
fi

# Menu de opções
echo "Escolha uma opção:"
echo "1. Iniciar ambos (Frontend + Backend)"
echo "2. Iniciar apenas Frontend"
echo "3. Iniciar apenas Backend"
echo "4. Instalar dependências"
echo "5. Parar serviços"
read -p "Opção [1-5]: " option

case $option in
    1)
        print_section "Iniciando Frontend e Backend"
        
        # Frontend em background
        print_section "Frontend (http://localhost:3000)"
        cd frontend
        npm install
        npm run dev &
        FRONTEND_PID=$!
        cd ..
        
        # Backend
        print_section "Backend (http://localhost:8000)"
        cd backend
        python -m venv venv
        if [ -d "venv" ]; then
            source venv/bin/activate 2>/dev/null || venv\Scripts\activate 2>/dev/null
        fi
        pip install -r requirements.txt
        python main.py &
        BACKEND_PID=$!
        cd ..
        
        echo -e "\n${GREEN}✅ Ambos os serviços estão rodando!${NC}"
        echo "Frontend: http://localhost:3000"
        echo "Backend API: http://localhost:8000"
        echo "Backend Docs: http://localhost:8000/docs"
        echo ""
        echo "Pressione Ctrl+C para parar..."
        wait
        ;;
        
    2)
        print_section "Iniciando Frontend"
        cd frontend
        npm install
        npm run dev
        ;;
        
    3)
        print_section "Iniciando Backend"
        cd backend
        python -m venv venv
        if [ -d "venv" ]; then
            source venv/bin/activate 2>/dev/null || venv\Scripts\activate 2>/dev/null
        fi
        pip install -r requirements.txt
        python main.py
        ;;
        
    4)
        print_section "Instalando dependências"
        
        print_section "Frontend"
        cd frontend
        npm install
        cd ..
        
        print_section "Backend"
        cd backend
        python -m venv venv
        if [ -d "venv" ]; then
            source venv/bin/activate 2>/dev/null || venv\Scripts\activate 2>/dev/null
        fi
        pip install -r requirements.txt
        cd ..
        
        echo -e "\n${GREEN}✅ Dependências instaladas!${NC}"
        ;;
        
    5)
        print_section "Parando serviços"
        pkill -f "next dev" || true
        pkill -f "python main.py" || true
        echo -e "${GREEN}✅ Serviços parados!${NC}"
        ;;
        
    *)
        echo -e "${RED}Opção inválida${NC}"
        exit 1
        ;;
esac
