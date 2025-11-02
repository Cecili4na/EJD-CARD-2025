export type SalesContext = 'lojinha' | 'lanchonete'

export interface SaleItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface SaleRecord {
  id: string // identificador de 4 dígitos em string
  context: SalesContext
  items: SaleItem[]
  total: number
  cardId?: string
  cardNumber?: string
  cardName?: string
  createdAt: string
}

class SalesService {
  private getStorageKey(context: SalesContext): string {
    return `sales_${context}`
  }

  private generate4DigitId(existingIds: Set<string>): string {
    // Gera um id de 4 dígitos, garantindo que não colida com os existentes
    // Tenta algumas vezes antes de aceitar possível colisão extremamente improvável
    for (let i = 0; i < 20; i++) {
      const id = Math.floor(1000 + Math.random() * 9000).toString()
      if (!existingIds.has(id)) return id
    }
    // fallback
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  getSales(context: SalesContext): SaleRecord[] {
    try {
      const key = this.getStorageKey(context)
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  saveSale(context: SalesContext, items: SaleItem[], card?: { id: string; cardNumber: string; cardName: string }): SaleRecord {
    const sales = this.getSales(context)
    const existingIds = new Set(sales.map(s => s.id))
    const id = this.generate4DigitId(existingIds)
    const total = items.reduce((acc, it) => acc + it.price * it.quantity, 0)
    const record: SaleRecord = {
      id,
      context,
      items,
      total,
      cardId: card?.id,
      cardNumber: card?.cardNumber,
      cardName: card?.cardName,
      createdAt: new Date().toISOString()
    }
    sales.unshift(record)
    localStorage.setItem(this.getStorageKey(context), JSON.stringify(sales))
    return record
  }
}

export const salesService = new SalesService()


