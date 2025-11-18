#!/bin/bash
# Script de Teste da API
# Testa todos os endpoints da API Express

API_URL="http://localhost:3001"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testando API Express..."
echo ""

# Teste 1: Health Check
echo "1️⃣  Testando Health Check..."
response=$(curl -s -w "\n%{http_code}" "$API_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ Health Check OK${NC}"
  echo "   Response: $body"
else
  echo -e "${RED}❌ Health Check FALHOU${NC}"
  echo "   HTTP Code: $http_code"
fi
echo ""

# Teste 2: Autenticação sem token
echo "2️⃣  Testando autenticação (sem token)..."
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/sales/list")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "401" ]; then
  echo -e "${GREEN}✅ Autenticação funcionando (bloqueou requisição sem token)${NC}"
  echo "   Response: $body"
else
  echo -e "${RED}❌ Autenticação FALHOU${NC}"
  echo "   HTTP Code: $http_code (esperado: 401)"
fi
echo ""

# Teste 3: Autenticação com token inválido
echo "3️⃣  Testando autenticação (token inválido)..."
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/sales/list" \
  -H "Authorization: Bearer token-invalido-123")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "401" ]; then
  echo -e "${GREEN}✅ Autenticação funcionando (bloqueou token inválido)${NC}"
  echo "   Response: $body"
else
  echo -e "${RED}❌ Autenticação FALHOU${NC}"
  echo "   HTTP Code: $http_code (esperado: 401)"
fi
echo ""

# Teste 4: Criar venda sem token
echo "4️⃣  Testando criar venda (sem token)..."
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/sales/create" \
  -H "Content-Type: application/json" \
  -d '{"cardNumber":"123","category":"lojinha","items":[]}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "401" ]; then
  echo -e "${GREEN}✅ Endpoint protegido (bloqueou sem token)${NC}"
  echo "   Response: $body"
else
  echo -e "${RED}❌ Endpoint não está protegido!${NC}"
  echo "   HTTP Code: $http_code (esperado: 401)"
fi
echo ""

# Teste 5: Validação de dados (com token válido mas dados inválidos)
echo "5️⃣  Testando validação de dados..."
echo -e "${YELLOW}   ⚠️  Este teste requer um token válido${NC}"
echo "   Para testar com token válido:"
echo "   1. Faça login no frontend"
echo "   2. Abra DevTools > Application > Local Storage"
echo "   3. Copie o token do Supabase"
echo "   4. Execute:"
echo "      curl -X POST $API_URL/api/sales/create \\"
echo "        -H 'Authorization: Bearer SEU_TOKEN_AQUI' \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"cardNumber\":\"123\",\"category\":\"lojinha\",\"items\":[{\"productId\":\"xxx\",\"quantity\":1}]}'"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Resumo dos Testes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Testes básicos concluídos!"
echo ""
echo "📝 Para testar com autenticação real:"
echo "   1. Inicie o servidor: npm run dev:api"
echo "   2. Inicie o frontend: npm run dev"
echo "   3. Faça login no frontend"
echo "   4. Use o token do Supabase nas requisições"
echo ""

