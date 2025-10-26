# 🎭 Instruções para Testar a Autenticação

## 🚀 **Servidores Rodando:**
- **Auth Server**: `http://localhost:3000` ✅
- **Frontend**: `http://localhost:5174` ✅

## 🧪 **Como Testar:**

### **1. Acesse o Sistema**
- Abra: `http://localhost:5174`
- Se der erro de cache, pressione `Ctrl+F5` (ou `Cmd+Shift+R` no Mac)

### **2. Registre uma Nova Conta**
- Clique na aba **"🎭 Registrar"**
- Preencha:
  - **Nome**: `Ana`
  - **Email**: `ana@encontrao.com`
  - **Senha**: `123456`
- Clique em **"🎭 Criar Conta"**

### **3. Você Será Automaticamente Logado!**
- Após o registro, você será redirecionado para o sistema
- Verá uma mensagem: "👋 Olá, Ana"

### **4. Veja sua Conta na Admin**
- Clique na aba **"👥 Admin"**
- Sua conta aparecerá na tabela com:
  - ID único
  - Nome: Ana
  - Email: ana@encontrao.com
  - Data de criação

### **5. Teste Logout**
- Clique no botão **"🚪 Sair"** no canto superior direito
- Você será redirecionado para a tela de login

## 🔧 **Se Der Problema:**

### **Cache do Navegador:**
1. Pressione `Ctrl+Shift+Delete` (ou `Cmd+Shift+Delete` no Mac)
2. Selecione "Cache" e "Dados de aplicativo"
3. Clique em "Limpar"
4. Recarregue a página com `Ctrl+F5`

### **Verificar Servidores:**
```bash
# Terminal 1 - Auth Server
cd /Users/ana/EJD-CARD-2025
npm run auth-server

# Terminal 2 - Frontend  
cd /Users/ana/EJD-CARD-2025
npm run dev
```

### **Testar API Diretamente:**
```bash
# Testar registro
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456","name":"Teste"}'

# Testar login
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'

# Ver usuários
curl http://localhost:3000/api/admin/users
```

## 🎉 **Funcionalidades Implementadas:**
- ✅ **Registro** de novos usuários
- ✅ **Login** com email e senha
- ✅ **Sessões persistentes** (7 dias)
- ✅ **Logout** funcional
- ✅ **Painel Admin** para ver usuários
- ✅ **Banco SQLite** local
- ✅ **Interface bonita** com tema do Mágico de Oz

## 📱 **URLs Importantes:**
- **Sistema**: `http://localhost:5174`
- **Auth API**: `http://localhost:3000/api/auth`
- **Admin API**: `http://localhost:3000/api/admin/users`
- **Health Check**: `http://localhost:3000/health`

