import { Routes, Route } from 'react-router-dom'
import CardsPage from './CardsPage'
import CreateCard from './CreateCard'
import CheckBalance from './CheckBalance'
import AddValue from './AddValue'
import DebitCard from './DebitCard'
import AssociateCard from './AssociateCard'

const CardsRouter = () => {
  return (
    <Routes>
      <Route index element={<CardsPage />} />
      <Route path="associate" element={<AssociateCard />} />
      <Route path="create" element={<CreateCard onBack={() => window.history.back()} />} />
      <Route path="balance" element={<CheckBalance onBack={() => window.history.back()} />} />
      <Route path="add" element={<AddValue onBack={() => window.history.back()} />} />
      <Route path="debit" element={<DebitCard onBack={() => window.history.back()} />} />
    </Routes>
  )
}

export default CardsRouter