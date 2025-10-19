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
    cardNumber: '1234567890123456',
    balance: 150.00
  },
  {
    id: '2',
    name: 'Maria Santos',
    cardNumber: '9876543210987654',
    balance: 75.50
  }
]

const CardsRouter = () => {
  const handleCreateCard = (cardData: { name: string; cardNumber: string; initialBalance: number }) => {
    console.log('Creating card:', cardData)
    // Aqui você pode adicionar a lógica para criar o cartão
  }

  const handleAddValue = (cardId: string, amount: number) => {
    console.log('Adding value:', cardId, amount)
    // Aqui você pode adicionar a lógica para adicionar valor
  }

  const handleDebit = (cardId: string, amount: number) => {
    console.log('Debiting:', cardId, amount)
    // Aqui você pode adicionar a lógica para debitar
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