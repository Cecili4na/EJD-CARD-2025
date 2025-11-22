import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createPayment, createPixQrCode, type BillingType } from '../lib/asaasClient.js'

function parseBillingType(value?: string): BillingType | null {
  if (!value) return null
  const upper = value.toUpperCase()
  return upper === 'PIX' || upper === 'BOLETO' || upper === 'CREDIT_CARD' ? (upper as BillingType) : null
}

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
    const { customerId, value, description, billingType, dueDate, externalReference, installmentCount, creditCard, creditCardHolderInfo } = body

    const type = parseBillingType(billingType)
    if (!customerId || !type || !value) {
      return res.status(400).json({ error: 'customerId, billingType e value são obrigatórios' })
    }

    const idempotencyKey = `pay:${customerId}:${type}:${value}:${description || 'no-desc'}`
    const payload = {
      customer: customerId,
      billingType: type,
      value: Number(value),
      description: description || 'Checkout EJD Card',
      dueDate: dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      externalReference,
      installmentCount,
      creditCard,
      creditCardHolderInfo,
    }

    const payment = await createPayment(payload, idempotencyKey)
    console.log('asaas payment response', {
      id: payment?.id,
      status: payment?.status,
      hasCopyPaste: !!(payment?.pixCopyPasteKey || payment?.payload),
      hasQr: !!(payment?.pixQrCodeImage || payment?.encodedImage || payment?.qrCode),
      hasPixTransaction: !!payment?.pixTransaction,
      keys: Object.keys(payment || {}),
    })

    let extraQr: { payload?: string; encodedImage?: string } | undefined
    const missingCode = !(payment?.pixCopyPasteKey || payment?.payload)
    const missingQr = !(payment?.pixQrCodeImage || payment?.encodedImage || payment?.qrCode)
    let extraAttempts: any = undefined
    if (missingCode || missingQr) {
      try {
        extraQr = await createPixQrCode(payment.id)
        extraAttempts = extraQr
        console.log('asaas pix qrCodes response', {
          hasPayload: !!extraQr?.payload,
          hasImage: !!extraQr?.encodedImage,
        })
      } catch (err) {
        console.warn('Falha ao gerar QR code PIX complementar:', (err as Error)?.message)
      }
    }

    res.setHeader('Cache-Control', 'no-store')
    return res.status(201).json({
      paymentId: payment.id,
      status: payment.status,
      charges: {
        invoiceUrl: payment.invoiceUrl,
        bankSlipUrl: payment.bankSlipUrl,
        // Asaas pode retornar copy-paste como pixCopyPasteKey ou payload
        pixCopyPasteKey:
          payment.pixCopyPasteKey ||
          payment.payload ||
          payment.pixTransaction?.payload ||
          extraQr?.payload,
        payload: payment.payload || payment.pixTransaction?.payload || extraQr?.payload,
        // QR code pode vir como pixQrCodeImage ou encodedImage (base64)
        pixQrCodeImage:
          payment.pixQrCodeImage ||
          payment.encodedImage ||
          payment.qrCode ||
          payment.pixTransaction?.qrCode ||
          payment.pixTransaction?.encodedImage ||
          extraQr?.encodedImage,
        encodedImage:
          payment.encodedImage ||
          payment.qrCode ||
          payment.pixTransaction?.encodedImage ||
          payment.pixTransaction?.qrCode ||
          extraQr?.encodedImage,
      },
      raw: payment,
      extraQr,
      extraAttempts,
    })
  } catch (error: any) {
    console.error('payments error', { message: error?.message })
    return res.status(500).json({ error: error?.message || 'Erro ao criar pagamento' })
  }
}
