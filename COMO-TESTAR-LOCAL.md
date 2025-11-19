# 🏠 Como Testar Localmente (Antes do Deploy)

## Opções Disponíveis

Você tem 3 formas de testar localmente:

### 🥇 Opção 1: Vercel CLI (RECOMENDADO - Simula exatamente o ambiente de produção)

O Vercel CLI simula o ambiente serverless exatamente como será no deploy.

```bash
# 1. Instalar Vercel CLI (apenas uma vez)
npm install -g vercel

# 2. Fazer login (apenas uma vez)
vercel login
# Vai abrir o navegador para você fazer login

# 3. Linkar o projeto (apenas uma vez)
cd /Users/ana/EJD-CARD-2025
vercel link
# Selecione o projeto existente ou crie um novo

# 4. Rodar em modo desenvolvimento
vercel dev

# Vai iniciar em: http://localhost:3000
```

#### Testando com Vercel Dev

Depois que `vercel dev` estiver rodando:

```bash
# Em outro terminal:

# 1. Teste básico (sem autenticação)
curl http://localhost:3000/api/cards/test

# Ou abra no navegador:
# http://localhost:3000/api/cards/test

# 2. Teste com o script
./test-api-cards.sh http://localhost:3000

# 3. Se tiver token, teste com autenticação
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/cards/list
```

**Vantagens:**
- ✅ Simula exatamente o ambiente Vercel
- ✅ Processa `vercel.json` corretamente
- ✅ Hot reload (atualiza ao salvar arquivos)
- ✅ Testa rewrites e serverless functions

**Desvantagens:**
- ⚠️ Precisa instalar Vercel CLI
- ⚠️ Mais lento para iniciar

---

### 🥈 Opção 2: Servidor Express (Mais Rápido)

Você já tem um servidor Express configurado!

```bash
# 1. Rodar o servidor
node server/index.ts

# Ou se tiver script no package.json:
npm run dev:server

# Vai iniciar em: http://localhost:3001
```

#### Testando com Express

```bash
# Em outro terminal:

# 1. Teste básico
curl http://localhost:3001/api/cards/list

# 2. Com o script
./test-api-cards.sh http://localhost:3001
```

**⚠️ ATENÇÃO:** 
- O servidor Express usa código de `server/routes/`
- As serverless functions estão em `api/`
- São códigos **DIFERENTES** (mas similares)
- Se funcionar no Express, **NÃO garante** que vai funcionar no Vercel

**Vantagens:**
- ✅ Mais rápido para iniciar
- ✅ Não precisa instalar nada novo
- ✅ Logs mais legíveis

**Desvantagens:**
- ❌ Não simula ambiente Vercel
- ❌ Não testa serverless functions de `api/`
- ❌ Não processa `vercel.json`

---

### 🥉 Opção 3: Teste Direto das Funções (Debug Avançado)

Para testar as funções serverless diretamente (sem servidor):

```bash
# Rodar o script de teste
node test-local-serverless.js
```

Esse script importa e executa as funções diretamente, sem HTTP.

**Vantagens:**
- ✅ Muito rápido
- ✅ Bom para debug
- ✅ Não precisa de servidor rodando

**Desvantagens:**
- ❌ Não simula HTTP real
- ❌ Não testa roteamento
- ❌ Mock limitado de request/response

---

## 🎯 Qual Opção Usar?

### Para Validar a Correção do Bug 404:

**Use a Opção 1 (Vercel CLI)**

O bug está relacionado ao roteamento do Vercel, então você precisa testar com o ambiente que simula o Vercel:

```bash
vercel dev
# Em outro terminal:
curl http://localhost:3000/api/cards/test
```

### Para Desenvolvimento Rápido:

**Use a Opção 2 (Express)**

Se você só quer testar lógica de negócio (não roteamento):

```bash
node server/index.ts
# Em outro terminal:
curl http://localhost:3001/api/cards/list
```

### Para Debug de Funções Específicas:

**Use a Opção 3 (Teste Direto)**

```bash
node test-local-serverless.js
```

---

## 📋 Checklist de Teste Local

### Antes do Deploy

- [ ] `vercel dev` inicia sem erros
- [ ] `http://localhost:3000/api/cards/test` retorna 200
- [ ] `http://localhost:3000/api/cards/list` retorna 401 (sem token) ou 200 (com token)
- [ ] Logs aparecem no terminal do `vercel dev`
- [ ] Não há erros de importação

### Se Tudo Funcionar Local

```bash
# Fazer deploy!
git add .
git commit -m "fix: corrigir rotas de cards no vercel"
git push
```

### Se NÃO Funcionar Local

Antes de fazer deploy, me avise com:
- Qual opção você usou para testar
- Comando que você rodou
- Resposta que você recebeu
- Logs do terminal

---

## 🛠️ Troubleshooting

### Problema: "vercel: command not found"

```bash
# Instalar Vercel CLI
npm install -g vercel

# Ou com yarn
yarn global add vercel

# Verificar instalação
vercel --version
```

### Problema: "Port 3000 already in use"

```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou usar outra porta
vercel dev --listen 3001
```

### Problema: "Cannot find module '@vercel/node'"

```bash
# Instalar dependências
npm install

# Ou especificamente
npm install @vercel/node --save-dev
```

### Problema: "Error connecting to Supabase"

Verifique se as variáveis de ambiente estão configuradas:

```bash
# Criar .env.local se não existir
cp .env .env.local

# Verificar se tem as variáveis:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_SUPABASE_SERVICE_ROLE_KEY=...
```

O Vercel CLI lê variáveis de `.env.local` automaticamente.

---

## 💡 Dicas

### Ver Logs Detalhados

```bash
# Vercel CLI com logs verbosos
vercel dev --debug
```

### Testar com Token Real

```bash
# 1. Fazer login no app (navegador)
# 2. Abrir DevTools → Application → Local Storage
# 3. Copiar o token
# 4. Usar no teste:

curl -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  http://localhost:3000/api/cards/list
```

### Hot Reload

O `vercel dev` atualiza automaticamente quando você salva arquivos!

```bash
# Terminal 1: vercel dev rodando
# Terminal 2: fazer alterações nos arquivos
# As mudanças são aplicadas automaticamente!
```

---

## 🎯 Próximos Passos

1. ✅ Escolher qual opção de teste usar
2. ✅ Rodar os testes localmente
3. ✅ Verificar se `/api/cards/test` funciona
4. ✅ Se funcionar local, fazer deploy
5. ✅ Testar em produção

---

**Recomendação:** Use `vercel dev` para validar a correção do bug 404!

