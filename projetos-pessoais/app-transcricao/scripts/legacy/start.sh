#!/bin/bash

echo "🚀 TranscribeAI - Iniciando Aplicação"
echo "=================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar se Node.js está instalado
print_info "Verificando pré-requisitos..."
if ! command -v node &> /dev/null; then
    print_warning "Node.js não encontrado. Instale em: https://nodejs.org/"
    exit 1
fi
print_success "Node.js encontrado"

# Verificar se Python está instalado
if ! command -v python &> /dev/null; then
    print_warning "Python não encontrado. Instale em: https://python.org/"
    exit 1
fi
print_success "Python encontrado"

echo ""
print_info "Iniciando Backend..."
cd backend

# Verificar se venv existe
if [ ! -d "venv" ]; then
    print_info "Criando ambiente virtual..."
    python -m venv venv
fi

# Ativar venv
source venv/bin/activate

# Instalar dependências se necessário
if [ ! -d "venv/lib/python3.*/site-packages/fastapi" ]; then
    print_info "Instalando dependências do backend..."
    pip install -r requirements.txt > /dev/null
fi

# Iniciar backend em background
python main.py &
BACKEND_PID=$!
print_success "Backend iniciando (PID: $BACKEND_PID)"

# Voltar para diretório root
cd ..

echo ""
print_info "Iniciando Frontend..."
cd frontend

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    print_info "Instalando dependências do frontend..."
    npm install > /dev/null
fi

# Iniciar frontend
npm run dev &
FRONTEND_PID=$!
print_success "Frontend iniciando (PID: $FRONTEND_PID)"

echo ""
echo "=================================="
print_success "Aplicação iniciada!"
echo "=================================="
echo ""
echo "🌐 Frontend:  http://localhost:3000"
echo "🔌 Backend:   http://localhost:8000"
echo "📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "Pressione Ctrl+C para parar a aplicação"
echo ""

# Aguardar Ctrl+C
wait
