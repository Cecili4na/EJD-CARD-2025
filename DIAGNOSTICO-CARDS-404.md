# 🔍 Diagnóstico: Problema 404 nas Rotas de Cards

## 📋 Resumo do Problema

As rotas de cards (`/api/cards/*`) estavam retornando 404, mesmo estando aparentemente configuradas igual às outras rotas.

## 🕵️ Investigação Realizada

### 1. **Estrutura Verificada** ✅
- ✅ Todas as funções serverless em `/api/cards/*.ts` existem
- ✅ Formato dos handlers está correto (export default async function)
- ✅ Estrutura idêntica às rotas de sales e products que funcionam

### 2. **Problema Identificado** ⚠️

O `vercel.json` continha um rewrite problemático:

```json
// ANTES (PROBLEMÁTICO)
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },  // ❌ Pode causar loop
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Por que isso é um problema?**
- O Vercel já detecta automaticamente arquivos em `/api/*` como serverless functions
- O rewrite `"/api/(.*)" -> "/api/$1"` pode causar loops ou conflitos
- As rotas de cards podem estar sendo afetadas diferentemente

### 3. **Correções Aplicadas** 🔧

#### A. Atualizado `vercel.json`

```json
// DEPOIS (CORRIGIDO)
{
  "version": 2,
  "rewrites": [
    { "source": "/((?!api).*)", "destination": "/index.html" }  // ✅ Exclui /api do rewrite
  ],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**O que mudou:**
- ✅ Removido rewrite desnecessário para `/api/*`
- ✅ Adicionado regex negativo `(?!api)` para excluir APIs do rewrite
- ✅ Apenas páginas SPA são redirecionadas para `/index.html`
- ✅ APIs ficam livres para serem processadas pelo Vercel

#### B. Adicionados Logs de Debug Detalhados

Todas as funções de cards agora têm logs extensivos:

```typescript
console.log('🔵 [CARDS/XXX] ========================================')
console.log('🔵 [CARDS/XXX] FUNÇÃO INVOCADA COM SUCESSO!')
console.log('🔵 [CARDS/XXX] ========================================')
console.log('🔵 [CARDS/XXX] Requisição recebida:', {
  method: req.method,
  url: req.url,
  timestamp: new Date().toISOString()
})
```

#### C. Criado Endpoint de Teste

`/api/cards/test` - Endpoint minimalista para verificar roteamento básico

## 🧪 Como Testar

### 1. **Deploy no Vercel**

```bash
# Fazer commit das mudanças
git add .
git commit -m "fix: corrigir rotas de cards no vercel"
git push origin feat/vercel-serverless

# O Vercel vai fazer deploy automaticamente
```

### 2. **Testar Endpoints**

Use o Postman, curl ou o navegador:

#### A. Teste Básico (sem autenticação)
```bash
# Deve retornar sucesso (não precisa de auth)
curl https://SEU-DOMINIO.vercel.app/api/cards/test
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "✅ Rota de cards funcionando!",
  "endpoint": "/api/cards/test",
  "timestamp": "2025-11-19T...",
  "environment": {
    "vercel": "production",
    "node": "production"
  }
}
```

#### B. Teste com Autenticação
```bash
# Obter token de autenticação primeiro (fazer login no app)
# Depois testar:

curl -H "Authorization: Bearer SEU_TOKEN" \
  https://SEU-DOMINIO.vercel.app/api/cards/list
```

**Resposta esperada (se tiver permissão):**
```json
[
  {
    "id": "...",
    "card_number": "...",
    "balance": 100
  }
]
```

### 3. **Verificar Logs no Vercel**

1. Acesse https://vercel.com/seu-projeto
2. Vá em **Deployments** → Último deploy → **Functions**
3. Clique em qualquer função de cards (ex: `api/cards/list`)
4. Veja os logs - deve aparecer:
   ```
   🔵 [CARDS/LIST] ========================================
   🔵 [CARDS/LIST] FUNÇÃO INVOCADA COM SUCESSO!
   🔵 [CARDS/LIST] ========================================
   ```

### 4. **Testar Localmente (opcional)**

Se quiser testar antes do deploy:

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Executar localmente
vercel dev

# Testar
curl http://localhost:3000/api/cards/test
```

## 📊 Checklist de Validação

- [ ] Deploy no Vercel concluído sem erros
- [ ] `/api/cards/test` retorna 200 OK
- [ ] `/api/cards/list` com token válido retorna dados (ou 403 se sem permissão)
- [ ] `/api/cards/create` com token válido funciona
- [ ] Logs aparecem no painel do Vercel
- [ ] Não há mais 404s nas rotas de cards

## 🐛 Se Ainda Tiver 404

Se após essas correções ainda houver 404:

### 1. Verificar Build do Vercel

No painel do Vercel:
- **Build Command**: `npm run build` ou `vite build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2. Verificar Estrutura de Arquivos

```bash
# Verificar se os arquivos estão no deploy
# No painel do Vercel → Deployments → View Source

# Deve ter:
api/
  cards/
    list.ts
    create.ts
    ...
```

### 3. Verificar Importações

Certifique-se que não há erros de importação:

```typescript
// Deve funcionar
import { supabase } from '../../server/lib/supabase'
import { authenticateRequest } from '../lib/auth'
```

### 4. Testar com curl Detalhado

```bash
# Ver headers completos
curl -v https://SEU-DOMINIO.vercel.app/api/cards/test

# Se retornar 404, verificar se é:
# - 404 do Vercel (função não encontrada)
# - 404 do código (rota não existe no handler)
```

## 🎯 Próximos Passos

1. ✅ Fazer deploy com as correções
2. ✅ Testar endpoint `/api/cards/test`
3. ✅ Testar endpoints reais com autenticação
4. ✅ Verificar logs no Vercel
5. ✅ Se funcionar, remover logs de debug excessivos (opcional)

## 💡 Explicação Técnica

**Por que o rewrite estava causando problema?**

O Vercel tem duas maneiras de servir conteúdo:
1. **Static Files** - HTML, CSS, JS do build
2. **Serverless Functions** - Arquivos em `/api/*`

Quando você adiciona um rewrite de `/api/*` para `/api/*`:
- O Vercel pode entrar em loop
- Ou não conseguir identificar corretamente as serverless functions
- Depende da ordem de processamento interna do Vercel

A solução é deixar `/api/*` livre para o Vercel processar naturalmente, e usar rewrites apenas para rotas do frontend SPA.

## 📝 Notas Adicionais

- As outras rotas (sales, products, orders) podem estar funcionando "por sorte" ou timing
- Esta correção deve melhorar a confiabilidade de TODAS as APIs
- O rewrite com regex negativo `(?!api)` é a prática recomendada

---

**Data**: 19/11/2025
**Branch**: feat/vercel-serverless
**Problema**: Rotas de cards retornando 404
**Status**: ✅ Correções aplicadas, aguardando teste

