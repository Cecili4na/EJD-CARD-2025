/**
 * Servidor Express Principal
 * Registra todas as rotas e configura middleware
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { salesRouter } from './routes/sales'
import { cardsRouter } from './routes/cards'
import { productsRouter } from './routes/products'
import { ordersRouter } from './routes/orders'

const app = express()
const PORT = 3001

// Debug: Verificar variáveis de ambiente
console.log('🔍 Verificando variáveis de ambiente:')
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Configurado' : '❌ Não encontrado')
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não encontrado')
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ Não encontrado')

// Middleware - CORS: permitir qualquer porta localhost em dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', 
  'http://localhost:3000',
  'http://localhost:5175' // caso mude de novo
]
app.use(cors({ 
  origin: (origin, callback) => {
    // Permitir requisições sem origin (tipo mobile apps) ou localhost em dev
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true 
}))
app.use(express.json())

// Registrar rotas
app.use('/api/sales', salesRouter)
app.use('/api/cards', cardsRouter)
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API rodando!' })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 API Simples rodando!')
  console.log(`📡 Endpoint: http://localhost:${PORT}`)
  console.log(`💚 Health: http://localhost:${PORT}/health`)
})

