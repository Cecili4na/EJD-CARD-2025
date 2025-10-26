import express from "express"
import cors from "cors"
import Database from "better-sqlite3"

const app = express()
const PORT = 3000

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}))
app.use(express.json())

// Criar banco SQLite
const db = new Database("./auth.db")

// Criar tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT NOT NULL,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES user (id)
  )
`)

// Rota de health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Auth server running" })
})

// Rota de registro
app.post("/api/auth/sign-up/email", async (req, res) => {
  try {
    const { email, password, name } = req.body
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, senha e nome são obrigatórios" })
    }

    // Verificar se email já existe
    const existingUser = db.prepare("SELECT * FROM user WHERE email = ?").get(email)
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" })
    }

    // Criar usuário (senha sem hash para simplicidade)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Definir role baseado no email (você pode alterar aqui!)
    let role = 'encontrista' // padrão
    if (email.includes('admin')) {
      role = 'admin'
    } else if (email.includes('genios')) {
      role = 'genios_card'
    } else if (email.includes('coord_lojinha')) {
      role = 'coord_lojinha'
    } else if (email.includes('coord_lanchonete')) {
      role = 'coord_lanchonete'
    } else if (email.includes('comunicacao')) {
      role = 'comunicacao'
    } else if (email.includes('vendedor_lojinha')) {
      role = 'vendedor_lojinha'
    } else if (email.includes('entregador')) {
      role = 'entregador_lojinha'
    } else if (email.includes('vendedor_lanchonete')) {
      role = 'vendedor_lanchonete'
    } else if (email === 'ana.ceci7373@gmail.com') {
      role = 'admin' // Sua conta como admin!
    }
    
    const stmt = db.prepare("INSERT INTO user (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)")
    stmt.run(userId, email, name, password, role)

    // Criar sessão
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const sessionStmt = db.prepare("INSERT INTO session (id, userId, token, expiresAt) VALUES (?, ?, ?, ?)")
    sessionStmt.run(sessionId, userId, token, expiresAt.toISOString())

    res.json({
      user: { id: userId, email, name, role },
      session: { id: sessionId, token }
    })
  } catch (error) {
    console.error("Erro no registro:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// Rota de login
app.post("/api/auth/sign-in/email", async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" })
    }

    // Buscar usuário
    const user = db.prepare("SELECT * FROM user WHERE email = ? AND password = ?").get(email, password)
    if (!user) {
      return res.status(401).json({ error: "Email ou senha inválidos" })
    }

    // Criar sessão
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const sessionStmt = db.prepare("INSERT INTO session (id, userId, token, expiresAt) VALUES (?, ?, ?, ?)")
    sessionStmt.run(sessionId, user.id, token, expiresAt.toISOString())

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      session: { id: sessionId, token }
    })
  } catch (error) {
    console.error("Erro no login:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// Rota para verificar sessão
app.get("/api/auth/get-session", (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.json({ user: null, session: null })
  }

  try {
    const session = db.prepare("SELECT * FROM session WHERE token = ? AND expiresAt > datetime('now')").get(token)
    if (!session) {
      return res.json({ user: null, session: null })
    }

    const user = db.prepare("SELECT * FROM user WHERE id = ?").get(session.userId)
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      session: { id: session.id, token: session.token }
    })
  } catch (error) {
    console.error("Erro ao verificar sessão:", error)
    res.json({ user: null, session: null })
  }
})

// Rota de logout
app.post("/api/auth/sign-out", (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (token) {
    db.prepare("DELETE FROM session WHERE token = ?").run(token)
  }
  
  res.json({ success: true })
})

// Rota admin para listar usuários
app.get("/api/admin/users", (req, res) => {
  try {
    const users = db.prepare("SELECT * FROM user ORDER BY createdAt DESC").all()
    res.json(users)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// Rota para atualizar role de usuário
app.put("/api/admin/users/:userId/role", (req, res) => {
  try {
    const { userId } = req.params
    const { role } = req.body
    
    if (!['admin', 'genios_card', 'coord_lojinha', 'coord_lanchonete', 'comunicacao', 'vendedor_lojinha', 'entregador_lojinha', 'vendedor_lanchonete', 'encontrista'].includes(role)) {
      return res.status(400).json({ error: "Role inválido" })
    }

    // Verificar se o usuário existe e não é admin
    const user = db.prepare("SELECT * FROM user WHERE id = ?").get(userId)
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" })
    }

    // Proteger admins de serem alterados
    if (user.role === 'admin') {
      return res.status(403).json({ error: "Não é possível alterar role de administradores" })
    }

    const stmt = db.prepare("UPDATE user SET role = ? WHERE id = ?")
    const result = stmt.run(role, userId)
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" })
    }
    
    res.json({ success: true, message: "Role atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar role:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Auth server running on http://localhost:${PORT}`)
  console.log(`📡 Auth endpoints: http://localhost:${PORT}/api/auth`)
})
