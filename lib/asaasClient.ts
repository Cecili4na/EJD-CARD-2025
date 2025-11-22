import axios, { AxiosError } from 'axios'
import crypto from 'crypto'

const baseURL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3'
const apiKey = process.env.ASAAS_API_KEY
const userAgent = 'EJD-CARD-2025/checkout'

if (!apiKey) {
  console.warn('ASAAS_API_KEY não configurada. Configure no ambiente antes do deploy.')
}

const client = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    'User-Agent': userAgent,
    access_token: apiKey || '',
  },
})

client.interceptors.request.use((config) => {
  if (!config.headers.access_token && apiKey) {
    config.headers.access_token = apiKey
  }
  return config
})

function toFriendlyError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<any>
    const msg =
      err.response?.data?.errors?.[0]?.description ||
      err.response?.data?.message ||
      err.message ||
      'Erro ao chamar Asaas'
    return new Error(msg)
  }
  return new Error((error as Error)?.message || 'Erro inesperado')
}

export interface CreateCustomerPayload {
  name: string
  email?: string
  cpfCnpj: string
  phone?: string
  externalReference?: string
}

export type BillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD'

export interface CreatePaymentPayload {
  customer: string
  billingType: BillingType
  value: number
  description?: string
  dueDate?: string
  externalReference?: string
  installmentCount?: number
  creditCard?: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
  creditCardHolderInfo?: {
    name: string
    email?: string
    cpfCnpj?: string
    phone?: string
    postalCode?: string
    addressNumber?: string
  }
}

export async function createCustomer(payload: CreateCustomerPayload, idempotencyKey?: string) {
  try {
    const res = await client.post('/customers', payload, {
      headers: { 'X-Idempotency-Key': idempotencyKey || crypto.randomUUID() },
    })
    return res.data
  } catch (error) {
    throw toFriendlyError(error)
  }
}

interface PixQrCodeResponse {
  encodedImage?: string
  payload?: string
  expirationDate?: string
  qrCode?: string
}

export async function createPayment(payload: CreatePaymentPayload, idempotencyKey?: string) {
  try {
    const res = await client.post('/payments', payload, {
      headers: { 'X-Idempotency-Key': idempotencyKey || crypto.randomUUID() },
    })
    return res.data
  } catch (error) {
    throw toFriendlyError(error)
  }
}

export async function createPixQrCode(paymentId: string) {
  // Tentativa 1: endpoint oficial /pix/qrCodes
  try {
    const res = await client.post(`/pix/qrCodes`, { payment: paymentId })
    return res.data as PixQrCodeResponse
  } catch (error) {
    // fallback para outros formatos usados em versões antigas
  }

  // Tentativa 2: endpoint alternativo por paymentId
  try {
    const res = await client.post(`/pix/qrCodes`, { paymentId })
    return res.data as PixQrCodeResponse
  } catch (error) {
    // continuar tentando
  }

  // Tentativa 3: endpoint por path /payments/{id}/pixQrCode
  try {
    const res = await client.post(`/payments/${paymentId}/pixQrCode`)
    return res.data as PixQrCodeResponse
  } catch (error) {
    throw toFriendlyError(error)
  }
}

export function verifyWebhookSignature(rawBody: Buffer, signature?: string | string[]) {
  const secret = process.env.ASAAS_WEBHOOK_SECRET
  if (!secret) return true
  if (!signature || typeof signature !== 'string') return false

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return signature === expected
}
