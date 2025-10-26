# 🔍 Teste de Acesso Admin

## 🎯 **Verificar se Admin tem Acesso Total**

### **📋 Checklist de Teste:**

#### **1. Login como Admin**
- ✅ **Email**: `ana.ceci7373@gmail.com`
- ✅ **Senha**: `123123`
- ✅ **Badge**: Deve mostrar "👑 Admin"

#### **2. Verificar Debug de Permissões**
- ✅ **Role**: Deve mostrar "admin"
- ✅ **É Admin**: Deve mostrar "✅"
- ✅ **Cartões**: Deve mostrar "✅ Ver, ✅ Criar, ✅ Editar, ✅ Deletar"
- ✅ **Lojinha**: Deve mostrar "✅ Ver, ✅ Gerenciar"
- ✅ **Lanchonete**: Deve mostrar "✅ Ver, ✅ Gerenciar"
- ✅ **Admin**: Deve mostrar "✅ Ver, ✅ Gerenciar"

#### **3. Verificar Navegação**
- ✅ **Abas visíveis**: Cartões, Lojinha, Lanchonete, Admin
- ✅ **Todas as abas** devem estar disponíveis

#### **4. Testar Acesso às Telas**

##### **💳 Cartões**
- ✅ **Acessar**: `/cards`
- ✅ **Funcionalidades**: Ver, criar, editar, deletar cartões

##### **🏪 Lojinha**
- ✅ **Acessar**: `/lojinha`
- ✅ **Funcionalidades**: Ver e gerenciar produtos

##### **🍔 Lanchonete**
- ✅ **Acessar**: `/lanchonete`
- ✅ **Funcionalidades**: Ver e gerenciar produtos

##### **👥 Admin**
- ✅ **Acessar**: `/admin`
- ✅ **Funcionalidades**: 
  - Ver lista de usuários
  - Gerenciar usuários (alterar roles)
  - Ver relatórios

### **🚨 Se Alguma Tela Não Funcionar:**

#### **Problema 1: Não consegue acessar uma tela**
```bash
# Verificar se servidor está rodando
curl http://localhost:3000/health

# Reiniciar servidor se necessário
pkill -f "node simple-auth-server.js"
npm run auth-server
```

#### **Problema 2: Permissões mostram "❌"**
```bash
# Corrigir role no banco
node meu-role.js
```

#### **Problema 3: Abas não aparecem**
- Verificar se está logado como admin
- Fazer logout e login novamente
- Verificar console do navegador (F12)

### **🔧 Comandos de Debug:**

#### **Verificar Role no Banco:**
```bash
node -e "
import Database from 'better-sqlite3';
const db = new Database('./auth.db');
const user = db.prepare('SELECT * FROM user WHERE email = ?').get('ana.ceci7373@gmail.com');
console.log('Role:', user?.role);
db.close();
"
```

#### **Forçar Role Admin:**
```bash
node meu-role.js
```

#### **Ver Todas as Permissões:**
```bash
node test-admin-access.js
```

### **📱 URLs para Testar:**
- **Sistema**: `http://localhost:5174`
- **Cartões**: `http://localhost:5174/cards`
- **Lojinha**: `http://localhost:5174/lojinha`
- **Lanchonete**: `http://localhost:5174/lanchonete`
- **Admin**: `http://localhost:5174/admin`

### **✅ Resultado Esperado:**
Como admin, você deve ter:
- ✅ **Acesso total** a todas as telas
- ✅ **Todas as abas** visíveis na navegação
- ✅ **Todas as funcionalidades** disponíveis
- ✅ **Debug mostra** todas as permissões como "✅"

## 🎉 **Se tudo estiver funcionando, você tem acesso total como admin!**

