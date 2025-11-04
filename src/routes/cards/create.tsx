import { createFileRoute } from '@tanstack/react-router'
import CreateCard from '../../pages/cards/CreateCard'

export const Route = createFileRoute('/cards/create')({
  component: () => <CreateCard onBack={() => window.history.back()} />,
})
