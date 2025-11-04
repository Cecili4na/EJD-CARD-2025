import { createFileRoute } from '@tanstack/react-router'
import DebitCard from '../../pages/cards/DebitCard'

export const Route = createFileRoute('/cards/debit')({
  component: () => <DebitCard onBack={() => window.history.back()} />,
})
