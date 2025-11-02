// Serviço de PIX - preparado para integração com API real
export interface PixPayment {
  id: string
  pixCode: string
  qrCodeUrl?: string
  amount: number
  expiresAt: Date
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired'
}

export interface PaymentStatus {
  id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'failed'
  confirmedAt?: Date
  errorMessage?: string
}

// Interface para providers de PIX
export interface PixProvider {
  generatePayment(amount: number, cardId: string): Promise<PixPayment>
  checkPaymentStatus(paymentId: string): Promise<PaymentStatus>
  cancelPayment(paymentId: string): Promise<void>
}

// Provider Mock (implementação atual simulada)
export class MockPixProvider implements PixProvider {
  async generatePayment(amount: number, _cardId: string): Promise<PixPayment> {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const id = `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const pixCode = `PIX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
    
    return {
      id,
      pixCode,
      amount,
      expiresAt,
      status: 'pending'
    }
  }

  async checkPaymentStatus(_paymentId: string): Promise<PaymentStatus> {
    // Simular verificação de status
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Por enquanto sempre retorna pending (simulação)
    return {
      id: _paymentId,
      status: 'pending'
    }
  }

  async cancelPayment(_paymentId: string): Promise<void> {
    // Simular cancelamento
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`PIX payment ${_paymentId} cancelled`)
  }
}

// Provider para API real (preparado para implementação futura)
export class ApiPixProvider implements PixProvider {
  constructor(_apiUrl: string, _apiKey: string) {
    // TODO: Implementar quando API real for configurada
  }

  async generatePayment(_amount: number, _cardId: string): Promise<PixPayment> {
    // TODO: Implementar chamada real para API PIX
    // Exemplo de estrutura:
    /*
    const response = await fetch(`${this.apiUrl}/pix/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        cardId,
        expiresIn: 900 // 15 minutos
      })
    })
    
    const data = await response.json()
    return {
      id: data.id,
      pixCode: data.pixCode,
      qrCodeUrl: data.qrCodeUrl,
      amount: data.amount,
      expiresAt: new Date(data.expiresAt),
      status: 'pending'
    }
    */
    
    throw new Error('API PIX não implementada ainda')
  }

  async checkPaymentStatus(_paymentId: string): Promise<PaymentStatus> {
    // TODO: Implementar verificação real de status
    /*
    const response = await fetch(`${this.apiUrl}/pix/payments/${paymentId}/status`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })
    
    const data = await response.json()
    return {
      id: paymentId,
      status: data.status,
      confirmedAt: data.confirmedAt ? new Date(data.confirmedAt) : undefined,
      errorMessage: data.errorMessage
    }
    */
    
    throw new Error('API PIX não implementada ainda')
  }

  async cancelPayment(_paymentId: string): Promise<void> {
    // TODO: Implementar cancelamento real
    /*
    await fetch(`${this.apiUrl}/pix/payments/${paymentId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })
    */
    
    throw new Error('API PIX não implementada ainda')
  }
}

// Factory function para obter o provider correto
export function getPixProvider(): PixProvider {
  const mode = (import.meta as any).env?.VITE_PIX_MODE || 'mock'
  const apiUrl = (import.meta as any).env?.VITE_PIX_API_URL
  const apiKey = (import.meta as any).env?.VITE_PIX_API_KEY

  if (mode === 'production' && apiUrl && apiKey) {
    return new ApiPixProvider(apiUrl, apiKey)
  }
  
  return new MockPixProvider()
}

// Instância global do provider
export const pixService = getPixProvider()
