#!/bin/bash

# Script de Teste para APIs de Cards
# Uso: ./test-api-cards.sh [BASE_URL] [TOKEN]
#
# Exemplos:
#   ./test-api-cards.sh http://localhost:3000
#   ./test-api-cards.sh https://seu-app.vercel.app SEU_TOKEN_JWT

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuração
BASE_URL=${1:-"http://localhost:3000"}
TOKEN=${2:-""}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🧪 Testando APIs de Cards${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Base URL: ${YELLOW}${BASE_URL}${NC}"
echo -e "Token: ${YELLOW}${TOKEN:0:20}...${NC}"
echo ""

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local needs_auth=$4
    local body=$5
    
    echo -e "${BLUE}---${NC}"
    echo -e "${BLUE}Testando: ${description}${NC}"
    echo -e "Endpoint: ${method} ${endpoint}"
    
    # Montar comando curl
    local curl_cmd="curl -s -w '\n\nHTTP_STATUS:%{http_code}\n' -X ${method}"
    
    if [ "$needs_auth" = "true" ] && [ -n "$TOKEN" ]; then
        curl_cmd="${curl_cmd} -H 'Authorization: Bearer ${TOKEN}'"
    fi
    
    if [ -n "$body" ]; then
        curl_cmd="${curl_cmd} -H 'Content-Type: application/json' -d '${body}'"
    fi
    
    curl_cmd="${curl_cmd} '${BASE_URL}${endpoint}'"
    
    # Executar
    response=$(eval $curl_cmd)
    
    # Extrair status
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d':' -f2)
    body_response=$(echo "$response" | grep -v "HTTP_STATUS:")
    
    # Verificar resultado
    if [ "$http_status" = "200" ] || [ "$http_status" = "201" ]; then
        echo -e "${GREEN}✅ Status: ${http_status}${NC}"
        echo "Resposta:"
        echo "$body_response" | jq '.' 2>/dev/null || echo "$body_response"
    elif [ "$http_status" = "401" ]; then
        echo -e "${YELLOW}⚠️  Status: ${http_status} (Não autorizado - token necessário)${NC}"
        echo "$body_response" | jq '.' 2>/dev/null || echo "$body_response"
    elif [ "$http_status" = "403" ]; then
        echo -e "${YELLOW}⚠️  Status: ${http_status} (Sem permissão)${NC}"
        echo "$body_response" | jq '.' 2>/dev/null || echo "$body_response"
    elif [ "$http_status" = "404" ]; then
        echo -e "${RED}❌ Status: ${http_status} (NÃO ENCONTRADO - PROBLEMA!)${NC}"
        echo "$body_response"
    else
        echo -e "${RED}❌ Status: ${http_status}${NC}"
        echo "$body_response" | jq '.' 2>/dev/null || echo "$body_response"
    fi
    
    echo ""
}

# 1. Teste básico (sem autenticação)
test_endpoint "GET" "/api/cards/test" "Teste Básico (sem auth)" "false"

# 2. Testes com autenticação (se token fornecido)
if [ -n "$TOKEN" ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Testes com Autenticação${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    test_endpoint "GET" "/api/cards/list" "Listar Todos os Cartões" "true"
    test_endpoint "GET" "/api/cards/my-card" "Meu Cartão" "true"
    test_endpoint "GET" "/api/cards/by-number?cardNumber=1234" "Buscar por Número" "true"
    
else
    echo -e "${YELLOW}⚠️  Token não fornecido. Testes com autenticação serão pulados.${NC}"
    echo -e "Para testar com autenticação, forneça o token:"
    echo -e "  ${GREEN}./test-api-cards.sh ${BASE_URL} SEU_TOKEN${NC}"
    echo ""
fi

# Comparação com outras APIs (sales)
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔍 Comparação: Testando API de Sales${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ -n "$TOKEN" ]; then
    test_endpoint "GET" "/api/sales/list" "Listar Vendas (para comparar)" "true"
else
    echo -e "${YELLOW}⚠️  Token necessário para testar Sales${NC}"
fi

# Resumo
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📊 Resumo${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Se todas as rotas de cards retornarem 404:"
echo -e "  ${RED}❌ Problema confirmado - verificar vercel.json e estrutura${NC}"
echo ""
echo -e "Se /api/cards/test retornar 200:"
echo -e "  ${GREEN}✅ Roteamento básico funciona${NC}"
echo ""
echo -e "Se outros endpoints retornarem 401/403:"
echo -e "  ${YELLOW}⚠️  Normal - requer autenticação/permissões${NC}"
echo ""
echo -e "Para mais detalhes, consulte: ${YELLOW}DIAGNOSTICO-CARDS-404.md${NC}"
echo ""

