import express from "express"
import cors from "cors"
import { auth } from "./src/lib/auth"
import { Pool } from "pg"

const app = express()
const PORT = process.env.PORT || 3000

// Configuração da conexão com Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/postgres"
})

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
    const result = await pool.query("SELECT * FROM \"user\" ORDER BY created_at DESC")
    res.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// Rota para atualizar role de usuário
app.put("/api/admin/users/:userId/role", async (req, res) => {
  try {
    const { userId } = req.params
    const { role } = req.body
    
    if (!['admin', 'genios_card', 'coord_lojinha', 'coord_lanchonete', 'comunicacao', 'vendedor_lojinha', 'entregador_lojinha', 'vendedor_lanchonete', 'encontrista'].includes(role)) {
      return res.status(400).json({ error: "Role inválido" })
    }

    // Verificar se o usuário existe e não é admin
    const userResult = await pool.query("SELECT * FROM \"user\" WHERE id = $1", [userId])
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" })
    }

    const user = userResult.rows[0]

    // Proteger admins de serem alterados
    if (user.role === 'admin') {
      return res.status(403).json({ error: "Não é possível alterar role de administradores" })
    }

    await pool.query(
      "UPDATE \"user\" SET role = $1, updated_at = NOW() WHERE id = $2",
      [role, userId]
    )
    
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
