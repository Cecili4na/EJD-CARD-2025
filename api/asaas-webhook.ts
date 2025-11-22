import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyWebhookSignature } from '../lib/asaasClient.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

type AsaasEvent =
  | 'PAYMENT_CREATED'
  | 'PAYMENT_UPDATED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_OVERDUE'
  | 'PAYMENT_DELETED'
  | 'PAYMENT_RESTORED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_REFUND_FAILED'
  | 'PAYMENT_ANTICIPATED'
  | 'PAYMENT_LINK_CREATED'
  | 'PAYMENT_RECEIVED_IN_CASH_UNDONE'
  | 'PAYMENT_CHARGEBACK_REQUESTED'
  | 'PAYMENT_CHARGEBACK_DISPUTE'
  | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL'
  | 'PAYMENT_CHARGEBACK_REVERSAL'
  | string

interface AsaasWebhookPayload {
  event?: AsaasEvent
  payment?: {
    id: string
    status?: string
    netValue?: number
    value?: number
    description?: string
    externalReference?: string
    pixTransaction?: {
      payload?: string
      encodedImage?: string
      qrCode?: string
      endToEndIdentifier?: string
    }
  }
}

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  if (Buffer.isBuffer((req as any).rawBody)) return (req as any).rawBody
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rawBody = await readRawBody(req)
  const signature = req.headers['asaas-signature'] || req.headers['x-asaas-signature']

  if (!verifyWebhookSignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  try {
    const payload: AsaasWebhookPayload = typeof req.body === 'object' && req.body ? req.body : JSON.parse(rawBody.toString('utf8') || '{}')
    console.log(JSON.stringify({
      source: 'asaas-webhook',
      event: payload?.event,
      status: payload?.payment?.status,
      paymentId: payload?.payment?.id,
      requestId: req.headers['x-request-id'] || ''
    }))

    if (!supabaseAdmin) {
      return res.status(200).json({ ok: true, message: 'Webhook recebido. Supabase admin não configurado.' })
    }

    const paymentId = payload?.payment?.id
    if (!paymentId) {
      return res.status(400).json({ error: 'payment.id ausente no webhook' })
    }

    const asaasStatus = (payload.payment.status || '').toLowerCase()
    const statusMap: Record<string, string> = {
      confirmed: 'confirmed',
      received: 'confirmed',
      pending: 'pending',
      overdue: 'failed',
      refunded: 'cancelled',
      deleted: 'cancelled',
      cancelled: 'cancelled',
    }
    const mappedStatus = statusMap[asaasStatus] || 'pending'

    // Atualizar pix_payments pelo external_id (paymentId) com fallback por txid se existir
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('pix_payments')
      .select('id, card_id, amount')
      .eq('external_id', paymentId)
      .maybeSingle()

    if (fetchErr) {
      console.error('pix_payments fetch error', fetchErr.message)
    }

    if (!existing) {
      // Nada para atualizar
      return res.status(200).json({ ok: true, message: 'payment não encontrado em pix_payments' })
    }

    const { error: updateErr } = await supabaseAdmin
      .from('pix_payments')
      .update({
        status: mappedStatus,
        webhook_data: payload,
        confirmed_at: mappedStatus === 'confirmed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('external_id', paymentId)

    if (updateErr) {
      console.error('pix_payments update error', updateErr.message)
    }

    // Se confirmado, creditar saldo e registrar transação
    if (mappedStatus === 'confirmed') {
      // Atualizar saldo do cartão (incremento)
      const { error: balanceErr } = await supabaseAdmin
        .from('cards')
        .update({ 
          balance: (existing.amount as number) + 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.card_id)

      if (balanceErr) {
        // Tentar incremento manual lendo saldo atual
        const { data: cardRow, error: cardErr } = await supabaseAdmin
          .from('cards')
          .select('balance')
          .eq('id', existing.card_id)
          .maybeSingle()
        if (!cardErr && cardRow) {
          const newBalance = Number(cardRow.balance || 0) + Number(existing.amount || 0)
          const { error: setErr } = await supabaseAdmin
            .from('cards')
            .update({ balance: newBalance, updated_at: new Date().toISOString() })
            .eq('id', existing.card_id)
          if (setErr) console.error('cards set balance error', setErr.message)
        }
      }

      const { error: txErr } = await supabaseAdmin
        .from('transactions')
        .insert({
          card_id: existing.card_id,
          amount: existing.amount,
          type: 'credit',
          description: 'Abastecimento via PIX (Asaas)',
          created_by: 'asaas_webhook',
        })
      if (txErr) console.error('transactions insert error', txErr.message)
    }

    return res.status(200).json({ ok: true })
  } catch (error: any) {
    console.error('asaas-webhook error', { message: error?.message })
    return res.status(500).json({ error: error?.message || 'Erro ao processar webhook' })
  }
}
