#!/bin/bash

# Script para testar rotas COM autenticação
# Execute: ./testar-com-token.sh SEU_TOKEN_AQUI

if [ -z "$1" ]; then
    echo "❌ Erro: Token não fornecido"
    echo "Uso: ./testar-com-token.sh SEU_TOKEN"
    exit 1
fi

TOKEN="$1"
BASE_URL="http://localhost:3000"

echo "🧪 =============================================="
echo "🧪 TESTANDO ROTAS COM AUTENTICAÇÃO"
echo "🧪 =============================================="
echo "Token: ${TOKEN:0:20}..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

test_route() {
    local num=$1
    local method=$2
    local endpoint=$3
    local description=$4
    local data=$5
    local expected_status=$6
    
    echo -e "${BLUE}TESTE $num: $method $endpoint${NC}"
    echo "Descrição: $description"
    echo "Status esperado: $expected_status"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" \
            -H "Authorization: Bearer $TOKEN" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X "$method" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    # Separar body e status (compatível com macOS)
    status=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    # Verificar resultado
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ Status: $status (esperado)${NC}"
    elif [ "$status" = "403" ] && [ "$expected_status" = "200" ]; then
        echo -e "${YELLOW}⚠️  Status: $status (sem permissão - normal se não for admin)${NC}"
    else
        echo -e "${RED}❌ Status: $status (esperado: $expected_status)${NC}"
    fi
    
    echo "Resposta:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    echo "---"
    echo ""
}

# TESTE 1: List cards (com auth - pode dar 403 se não tiver permissão)
test_route 1 "GET" "/api/cards/list" \
    "Listar todos os cartões (COM autenticação)" \
    "" \
    "200"

# TESTE 2: My card (com auth - deve funcionar)
test_route 2 "GET" "/api/cards/my-card" \
    "Meu cartão (COM autenticação)" \
    "" \
    "200"

# TESTE 3: By number (com auth)
test_route 3 "GET" "/api/cards/by-number?cardNumber=1234" \
    "Buscar por número (COM autenticação)" \
    "" \
    "200"

# TESTE 4: Create (com auth - pode dar 403 se não tiver permissão)
test_route 4 "POST" "/api/cards/create" \
    "Criar cartão (COM autenticação)" \
    '{"name":"Test User","cardNumber":"TEST999","cardCode":"1234","phoneNumber":"123456789","initialBalance":50}' \
    "200"

# Resumo
echo ""
echo "🧪 =============================================="
echo "🧪 RESUMO DOS TESTES COM AUTENTICAÇÃO"
echo "🧪 =============================================="
echo ""
echo -e "${YELLOW}Possíveis resultados:${NC}"
echo "   - 200 ✅ = Funcionou!"
echo "   - 403 ⚠️  = Sem permissão (normal se não for admin)"
echo "   - 404 ⚠️  = Cartão não encontrado (normal)"
echo "   - 401 ❌ = Token inválido"
echo "   - 500 ❌ = Erro no servidor"
echo ""

