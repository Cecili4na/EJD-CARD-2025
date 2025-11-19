# 🚨 CORREÇÃO: Problema 404 nas Rotas de Cards

## 🔍 O Problema

As rotas `/api/cards/*` estavam retornando 404 no Vercel.

## ✅ A Solução

**Encontrei o problema!** O `vercel.json` tinha um rewrite que estava causando conflito:

```json
// ❌ ANTES (problemático)
{ "source": "/api/(.*)", "destination": "/api/$1" }

// ✅ DEPOIS (corrigido)
{ "source": "/((?!api).*)", "destination": "/index.html" }
```

## 🧪 Como Testar

### 🏠 TESTAR LOCAL (Recomendado - antes do deploy)

```bash
# 1. Instalar Vercel CLI (só uma vez)
npm install -g vercel

# 2. Rodar em modo desenvolvimento
vercel dev

# 3. Testar (em outro terminal)
curl http://localhost:3000/api/cards/test

# Ou usar o script:
./test-api-cards.sh http://localhost:3000
```

**📖 Guia completo:** `COMO-TESTAR-LOCAL.md`

---

### ☁️ TESTAR EM PRODUÇÃO (após deploy)

```bash
# 1. Fazer Deploy
git add .
git commit -m "fix: corrigir rotas de cards no vercel"
git push

# 2. Testar no navegador (substitua pelo seu domínio)
https://seu-app.vercel.app/api/cards/test

# 3. Ou usar o script
./test-api-cards.sh https://seu-app.vercel.app SEU_TOKEN_JWT
```

Deve retornar:
```json
{
  "success": true,
  "message": "✅ Rota de cards funcionando!"
}
```

## 📝 O Que Foi Feito

1. ✅ Corrigido `vercel.json` - removido rewrite problemático
2. ✅ Adicionados logs detalhados em todas as funções de cards
3. ✅ Criado endpoint de teste `/api/cards/test`
4. ✅ Criado script de teste `test-api-cards.sh`
5. ✅ Documentação completa em `DIAGNOSTICO-CARDS-404.md`

## 🎯 Próximo Passo

**Faça o deploy e teste!** Se ainda tiver problema, me avise com:
- URL que você está tentando acessar
- Logs do console do Vercel
- Resposta que você está recebendo

---

**Mais detalhes técnicos:** `DIAGNOSTICO-CARDS-404.md`

