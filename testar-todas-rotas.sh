#!/bin/bash

# Script para testar TODAS as rotas de cards
# Execute: ./testar-todas-rotas.sh

BASE_URL="http://localhost:3000"

echo "🧪 =============================================="
echo "🧪 TESTANDO TODAS AS ROTAS DE CARDS"
echo "🧪 =============================================="
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
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
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
    else
        echo -e "${RED}❌ Status: $status (esperado: $expected_status)${NC}"
    fi
    
    echo "Resposta:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    echo "---"
    echo ""
}

# TESTE 1: Endpoint público (sem auth)
test_route 1 "GET" "/api/cards/test" \
    "Endpoint de teste (público)" \
    "" \
    "200"

# TESTE 2: List cards (sem auth - deve dar 401)
test_route 2 "GET" "/api/cards/list" \
    "Listar todos os cartões (sem autenticação)" \
    "" \
    "401"

# TESTE 3: My card (sem auth - deve dar 401)
test_route 3 "GET" "/api/cards/my-card" \
    "Meu cartão (sem autenticação)" \
    "" \
    "401"

# TESTE 4: By number (sem auth - deve dar 401)
test_route 4 "GET" "/api/cards/by-number?cardNumber=1234" \
    "Buscar por número (sem autenticação)" \
    "" \
    "401"

# TESTE 5: Create (sem auth - deve dar 401)
test_route 5 "POST" "/api/cards/create" \
    "Criar cartão (sem autenticação)" \
    '{"name":"Test","cardNumber":"9999","cardCode":"1234","phoneNumber":"123456"}' \
    "401"

# TESTE 6: Associate (sem auth - deve dar 401)
test_route 6 "POST" "/api/cards/associate" \
    "Associar cartão (sem autenticação)" \
    '{"cardNumber":"9999","cardCode":"1234"}' \
    "401"

# TESTE 7: Update balance (sem auth - deve dar 401)
test_route 7 "POST" "/api/cards/update-balance" \
    "Atualizar saldo (sem autenticação)" \
    '{"cardId":"123e4567-e89b-12d3-a456-426614174000","amount":10,"type":"credit"}' \
    "401"

# Resumo
echo ""
echo "🧪 =============================================="
echo "🧪 RESUMO DOS TESTES"
echo "🧪 =============================================="
echo ""
echo -e "${GREEN}✅ Se todos os testes acima passaram:${NC}"
echo "   - /api/cards/test retornou 200 ✅"
echo "   - Todas as outras rotas retornaram 401 ✅"
echo ""
echo -e "${BLUE}Conclusão:${NC}"
echo "   1. ✅ Roteamento está funcionando!"
echo "   2. ✅ Autenticação está funcionando!"
echo "   3. ✅ Todas as 7 rotas de cards estão acessíveis!"
echo ""
echo -e "${YELLOW}Próximo passo:${NC}"
echo "   Fazer deploy no Vercel:"
echo "   ${GREEN}git add . && git commit -m 'fix: corrigir rotas de cards' && git push${NC}"
echo ""

