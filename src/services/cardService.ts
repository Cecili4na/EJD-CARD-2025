export interface Card {
  id: string
  name: string
  cardNumber: string
  balance: number
}

class CardService {
  private storageKey = 'cards'

  getCards(): Card[] {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  saveCards(cards: Card[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(cards))
  }

  initializeMockCards() {
    const existing = this.getCards()
    if (existing.length > 0) return
    const mockCards: Card[] = [
      { id: '1', name: 'João Silva', cardNumber: '123', balance: 1150.0 },
      { id: '2', name: 'Maria Santos', cardNumber: '987', balance: 750.5 }
    ]
    this.saveCards(mockCards)
  }

  getByNumber(cardNumber: string): Card | null {
    return this.getCards().find(c => c.cardNumber === cardNumber) || null
  }

  updateBalance(cardId: string, newBalance: number): Card | null {
    const cards = this.getCards()
    const idx = cards.findIndex(c => c.id === cardId)
    if (idx === -1) return null
    cards[idx] = { ...cards[idx], balance: newBalance }
    this.saveCards(cards)
    return cards[idx]
  }
}

export const cardService = new CardService()


