/**
 * GET /api/cards/test
 * Endpoint de teste para diagnosticar problemas de roteamento
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🎯 [CARDS/TEST] ========================================')
  console.log('🎯 [CARDS/TEST] TESTE FUNCIONANDO!')
  console.log('🎯 [CARDS/TEST] ========================================')
  console.log('🎯 [CARDS/TEST] Requisição recebida:', {
    method: req.method,
    url: req.url,
    headers: Object.keys(req.headers),
    query: req.query,
    timestamp: new Date().toISOString(),
    vercelEnv: process.env.VERCEL_ENV,
    nodeEnv: process.env.NODE_ENV
  })

  return res.status(200).json({
    success: true,
    message: '✅ Rota de cards funcionando!',
    endpoint: '/api/cards/test',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    environment: {
      vercel: process.env.VERCEL_ENV || 'local',
      node: process.env.NODE_ENV || 'development'
    }
  })
}

