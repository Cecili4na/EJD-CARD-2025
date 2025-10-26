# 👥 Guia de Gerenciamento de Usuários

## 🎭 **Como Alterar Roles de Usuários**

### **📋 Passo a Passo:**

1. **Faça login como Admin**
   - Email: `ana.ceci7373@gmail.com`
   - Senha: `123123`

2. **Acesse o Painel Admin**
   - Clique na aba "👥 Admin"
   - Clique em "⚙️ Gerenciar Usuários"

3. **Alterar Role de um Usuário**
   - Clique em "✏️ Editar" na linha do usuário
   - Selecione o novo role no dropdown:
     - 👑 **Admin**: Acesso total
     - 👨‍💼 **Manager**: Pode gerenciar lojinha/lanchonete
     - 👤 **User**: Usuário comum
     - 👻 **Guest**: Acesso limitado
   - Clique em "✅ Salvar"

### **🔒 Proteções Implementadas:**

#### **✅ O que Admins PODEM fazer:**
- ✅ Alterar roles de **managers**, **users** e **guests**
- ✅ Ver todos os usuários
- ✅ Gerenciar lojinha e lanchonete
- ✅ Acessar relatórios

#### **❌ O que Admins NÃO PODEM fazer:**
- ❌ Alterar role de **outros admins** (proteção)
- ❌ Remover outros admins
- ❌ Alterar sua própria conta (por segurança)

### **🎯 Roles e Permissões:**

#### **👑 Admin**
- ✅ **Tudo**: Acesso total ao sistema
- ✅ **Gerenciar usuários**: Alterar roles
- ✅ **Relatórios**: Ver tudo
- ✅ **Cartões**: Criar, editar, deletar
- ✅ **Lojinha/Lanchonete**: Gerenciar produtos

#### **👨‍💼 Manager**
- ✅ **Cartões**: Ver e criar
- ✅ **Lojinha/Lanchonete**: Gerenciar produtos
- ✅ **Admin**: Ver (mas não gerenciar usuários)
- ❌ **Gerenciar usuários**: Não pode alterar roles
- ❌ **Deletar cartões**: Não pode deletar

#### **👤 User**
- ✅ **Cartões**: Ver e criar
- ✅ **Lojinha/Lanchonete**: Ver produtos
- ❌ **Admin**: Não pode acessar
- ❌ **Gerenciar**: Não pode gerenciar nada

#### **👻 Guest**
- ❌ **Acesso muito limitado**
- ❌ **Não pode ver quase nada**

### **🛠️ Comandos Úteis:**

#### **Alterar SEU role para admin:**
```bash
node meu-role.js
```

#### **Ver todos os usuários:**
```bash
node -e "
import Database from 'better-sqlite3';
const db = new Database('./auth.db');
const users = db.prepare('SELECT * FROM user').all();
console.table(users);
db.close();
"
```

#### **Criar novo admin:**
```bash
node -e "
import Database from 'better-sqlite3';
const db = new Database('./auth.db');
const adminId = 'admin_' + Date.now();
db.prepare('INSERT INTO user (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)')
  .run(adminId, 'novo@admin.com', 'Novo Admin', '123456', 'admin');
console.log('Admin criado!');
db.close();
"
```

### **🚨 Troubleshooting:**

#### **Se não conseguir alterar roles:**
1. Verifique se está logado como admin
2. Verifique se o servidor está rodando
3. Tente fazer logout e login novamente

#### **Se aparecer "🔒 Protegido":**
- Isso é normal para outros admins
- Apenas admins não podem alterar outros admins

#### **Se der erro de conexão:**
```bash
# Verificar se servidor está rodando
curl http://localhost:3000/health

# Reiniciar servidor
pkill -f "node simple-auth-server.js"
npm run auth-server
```

### **📱 URLs Importantes:**
- **Sistema**: `http://localhost:5174`
- **Admin**: `http://localhost:5174/admin`
- **Gerenciar Usuários**: `http://localhost:5174/admin` → "⚙️ Gerenciar Usuários"

## 🎉 **Agora você pode gerenciar todos os usuários do sistema!**

