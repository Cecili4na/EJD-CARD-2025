import { Routes, Route } from 'react-router-dom'
import CardsPage from './CardsPage'
import CreateCard from './CreateCard'
import CheckBalance from './CheckBalance'
import AddValue from './AddValue'
import DebitCard from './DebitCard'

// Dados mock para os cartões
const mockCards = [
  {
    id: '1',
    name: 'João Silva',
    cardNumber: '123',
    balance: 150.00
  },
  {
    id: '2',
    name: 'Maria Santos',
    cardNumber: '987',
    balance: 75.50
  }
]

const CardsRouter = () => {
  const handleCreateCard = (cardData: { name: string; cardNumber: string; initialBalance: number }) => {
    console.log('Creating card:', cardData)
    mockCards.push({
      id: (mockCards.length + 1).toString(),
      name: cardData.name,
      cardNumber: cardData.cardNumber,
      balance: cardData.initialBalance
    })

  }

  const handleAddValue = (cardId: string, amount: number) => {
    console.log('Adding value:', cardId, amount)
    const card = mockCards.find(card => card.id === cardId)
    if (card) {
      card.balance += amount
    } else {
      console.error(`Card with id ${cardId} not found.`)
    }
  }

  const handleDebit = (cardId: string, amount: number) => {
    console.log('Debiting:', cardId, amount)
    const card = mockCards.find(card => card.id === cardId)
    if (card) {
      card.balance -= amount
    } else {
      console.error(`Card with id ${cardId} not found.`)
    }
  }

  return (
    <Routes>
      <Route index element={<CardsPage />} />
      <Route path="create" element={<CreateCard onBack={() => window.history.back()} onCreateCard={handleCreateCard} />} />
      <Route path="balance" element={<CheckBalance onBack={() => window.history.back()} cards={mockCards} />} />
      <Route path="add" element={<AddValue onBack={() => window.history.back()} cards={mockCards} onAddValue={handleAddValue} />} />
      <Route path="debit" element={<DebitCard onBack={() => window.history.back()} cards={mockCards} onDebit={handleDebit} />} />
    </Routes>
  )
}

export default CardsRouter