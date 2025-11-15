# 🧪 Como Testar a POC - Backend Seguro

## 📋 Pré-requisitos

1. ✅ Dependências instaladas (`npm install` já foi executado)
2. ✅ Supabase configurado com variáveis de ambiente
3. ✅ Banco de dados com produtos cadastrados

---

## 🚀 Passo a Passo

### 1. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

### 2. Acessar a página de teste

Abra o navegador em:
```
http://localhost:5173/test-poc
```

### 3. Fazer login

- Use suas credenciais do Supabase
- O sistema vai detectar sua role automaticamente

### 4. Testar a API

Na página de teste você verá:

#### 🛒 **Testar Criar Venda**
- Digite o número do cartão (ex: "777")
- Selecione a categoria (Lojinha, Lanchonete ou Sapatinho)
- Clique em "Testar Criar Venda"

**O que acontece:**
1. ✅ Frontend envia apenas: `cardNumber`, `category`, `items`
2. ✅ Backend valida token JWT
3. ✅ Backend verifica permissões do usuário
4. ✅ Backend valida dados com Zod
5. ✅ Backend busca produtos e preços do BANCO
6. ✅ Backend verifica saldo do cartão
7. ✅ Backend cria venda em transação SQL atômica
8. ✅ Frontend recebe resultado type-safe

#### 📋 **Testar Listar Vendas**
- Selecione a categoria
- Clique em "Testar Listar Vendas"
- Verá o histórico com permissões verificadas

---

## 🔍 O que observar

### ✅ **Cenários de Sucesso**

1. **Venda com saldo suficiente**
   - Resultado: ✅ Venda criada, saldo atualizado

2. **Listagem de vendas**
   - Resultado: ✅ Histórico carregado conforme permissão

### ❌ **Cenários de Erro (Esperados)**

1. **Saldo insuficiente**
   ```
   ❌ Saldo insuficiente. Necessário: R$ X, Disponível: R$ Y
   ```

2. **Sem permissão para categoria**
   ```
   ❌ Você não tem permissão para vender em: [categoria]
   ```

3. **Produto inválido**
   ```
   ❌ Um ou mais produtos não foram encontrados ou estão inativos
   ```

4. **Não autenticado**
   ```
   ❌ Você precisa estar autenticado para realizar esta ação
   ```

---

## 🧪 Testes de Segurança

### Teste 1: Manipular preço no DevTools

1. Abra DevTools (F12)
2. Tente executar:
   ```javascript
   // ❌ Não funciona mais! Backend busca preço do banco
   await fetch('/api/trpc/sales.create', {
     method: 'POST',
     body: JSON.stringify({
       items: [{ productId: 'xxx', price: 0.01 }] // Preço falso
     })
   })
   ```
3. **Resultado esperado:** Backend ignora o preço e usa o do banco

### Teste 2: Criar venda sem autenticação

1. Abra uma aba anônima
2. Tente acessar `http://localhost:5173/test-poc`
3. **Resultado esperado:** Redirecionado para login

### Teste 3: Tentar vender em categoria sem permissão

1. Faça login como `vendedor_lanchonete`
2. Tente criar venda em "Lojinha"
3. **Resultado esperado:** 
   ```
   ❌ Você não tem permissão para vender em: lojinha
   ```

---

## 🐛 Troubleshooting

### Erro: "Failed to fetch"

**Causa:** API tRPC não está respondendo

**Solução:**
1. Verifique se o servidor está rodando (`npm run dev`)
2. Verifique se a rota `/api/trpc/` está configurada no `vercel.json`
3. Veja o console do navegador e do terminal

### Erro: "Unauthorized"

**Causa:** Token JWT inválido ou expirado

**Solução:**
1. Faça logout e login novamente
2. Verifique se as variáveis de ambiente do Supabase estão corretas

### Erro: "Produto não encontrado"

**Causa:** Banco de dados não tem produtos cadastrados

**Solução:**
1. Acesse o painel do Supabase
2. Cadastre produtos nas categorias:
   - `products` (categoria: 'lojinha' ou 'lanchonete')
   - `sapatinho_products`

---

## 📊 Logs e Debugging

### Ver logs do backend

No terminal onde rodou `npm run dev`, você verá:

```
🔐 SECURITY LOG: Create sale
  userId: xxx
  role: vendedor_lojinha
  category: lojinha
  cardNumber: 777
  itemCount: 1

✅ SALE CREATED:
  saleId: yyy
  total: 25.50
  userId: xxx
```

### Ver logs do frontend

No console do navegador (F12), aba Console:

```javascript
// Ver dados da mutation
console.log(createSale.data)

// Ver erros
console.log(createSale.error)
```

---

## 🎯 Próximos Passos

Depois de testar e validar a POC:

1. **Migrar outras operações** (cards, products, orders)
2. **Remover acessos diretos ao Supabase** do frontend
3. **Implementar rate limiting** (proteção contra spam)
4. **Adicionar logs de auditoria** em tabela separada
5. **Deploy na Vercel** (automático ao fazer push)

---

## 📝 Comparação: Antes vs Depois

### ❌ ANTES (Inseguro)
```typescript
// Frontend tinha controle total
const total = items.reduce((sum, item) => 
  sum + item.price * item.quantity, 0) // Preço manipulável!

await supabase.from('sales').insert({ total }) // Sem validação!
await supabase.from('cards').update({ 
  balance: balance - total // Race condition!
})
```

### ✅ DEPOIS (Seguro)
```typescript
// Frontend envia apenas dados básicos
const result = await createSale.mutateAsync({
  cardNumber: '777',
  category: 'lojinha',
  items: [{ productId: 'uuid', quantity: 1 }]
  // Sem preço! Backend busca do banco
})

// Backend faz TUDO de forma segura:
// ✅ Valida auth
// ✅ Verifica permissões
// ✅ Busca preços reais
// ✅ Verifica saldo
// ✅ Transação atômica SQL
```

---

## 🎉 Sucesso!

Se você conseguiu:
- ✅ Criar uma venda pela interface
- ✅ Ver mensagem de sucesso com novo saldo
- ✅ Receber erro quando sem permissão
- ✅ Ver histórico de vendas

**Parabéns! A POC está funcionando perfeitamente! 🚀**

Agora você pode migrar gradualmente o resto da aplicação para este padrão seguro.

