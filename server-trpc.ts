/**
 * Servidor tRPC para desenvolvimento local
 * 
 * Em produção, a Vercel cuida disso automaticamente
 * Em desenvolvimento, precisamos de um servidor Express
 */

import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './src/server/routers/_app'
import { createContext } from './src/server/trpc'

const app = express()
const PORT = 3001

// CORS para desenvolvimento
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

// Middleware tRPC
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`❌ tRPC Error on ${path}:`, error)
    },
  })
)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'tRPC server is running' })
})

app.listen(PORT, () => {
  console.log('🚀 tRPC Server running!')
  console.log(`📡 API: http://localhost:${PORT}/api/trpc`)
  console.log(`💚 Health: http://localhost:${PORT}/health`)
})

