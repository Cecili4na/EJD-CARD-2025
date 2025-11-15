# ✅ SERVIDOR CONFIGURADO - COMO TESTAR

## 🚀 Mudanças Feitas:

1. ✅ Criado servidor tRPC Express para desenvolvimento (`server-trpc.ts`)
2. ✅ Configurado cliente para usar servidor local em dev
3. ✅ Script `dev:full` executa tudo junto

---

## 🎯 COMO TESTAR AGORA:

### Passo 1: Parar o servidor antigo (se ainda estiver rodando)
Pressione `Ctrl+C` no terminal

### Passo 2: Iniciar servidor completo
```bash
npm run dev:full
```

Você deverá ver:
```
🚀 tRPC Server running!
📡 API: http://localhost:3001/api/trpc
💚 Health: http://localhost:3001/health

VITE v4.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Passo 3: Acessar a página de teste
```
http://localhost:5173/test-poc
```

### Passo 4: Testar!
1. Faça login
2. Digite número do cartão (ex: "777")
3. Selecione categoria
4. Clique em "Testar Criar Venda"

---

## 🔧 Arquitetura:

```
Frontend (localhost:5173)
    ↓ HTTP Request
tRPC Server (localhost:3001)
    ↓ SQL
Supabase Database
```

---

## 🐛 Se der erro:

### Erro de CORS
✅ Já configurado! O servidor Express tem CORS habilitado.

### Erro de conexão
Verifique se ambos servidores estão rodando:
- ✅ Vite em `localhost:5173`
- ✅ tRPC em `localhost:3001`

### Ver logs
- **Backend:** Aparecem no terminal onde rodou `npm run dev:full`
- **Frontend:** F12 → Console

---

## 📊 O que observar:

Quando criar uma venda, você verá no terminal:

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
```

---

**Acesse:** http://localhost:5173/test-poc

Qualquer erro, me mostre! 🚀

