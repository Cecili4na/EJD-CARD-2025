import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createCustomer } from '../lib/asaasClient.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'object' && req.body ? req.body : JSON.parse(req.body || '{}')
    const { name, email, cpfCnpj, phone, externalReference } = body

    if (!name || !cpfCnpj) {
      return res.status(400).json({ error: 'Nome e CPF/CNPJ são obrigatórios' })
    }

    const sanitizedCpfCnpj = String(cpfCnpj).replace(/\D/g, '')
    const idempotencyKey = `customer:${sanitizedCpfCnpj}:${(email || '').toLowerCase()}`

    const customer = await createCustomer(
      {
        name,
        email,
        cpfCnpj: sanitizedCpfCnpj,
        phone,
        externalReference,
      },
      idempotencyKey
    )

    res.setHeader('Cache-Control', 'no-store')
    return res.status(201).json({ customer })
  } catch (error: any) {
    console.error('customers error', { message: error?.message })
    return res.status(500).json({ error: error?.message || 'Erro ao criar cliente' })
  }
}
