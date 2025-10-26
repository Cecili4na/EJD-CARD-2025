import express from "express"
import cors from "cors"
import { auth } from "./src/lib/auth"

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // URL do frontend
  credentials: true
}))
app.use(express.json())

// Rotas do Better Auth
app.use("/api/auth", auth.handler)

// Rota de health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Auth server running" })
})

// Rota admin para listar usuários
app.get("/api/admin/users", async (req, res) => {
  try {
    const Database = (await import("better-sqlite3")).default
    const db = new Database("./auth.db")
    
    const users = db.prepare("SELECT * FROM user ORDER BY createdAt DESC").all()
    db.close()
    
    res.json(users)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Auth server running on http://localhost:${PORT}`)
  console.log(`📡 Auth endpoints: http://localhost:${PORT}/api/auth`)
})
