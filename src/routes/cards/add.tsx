import { createFileRoute } from '@tanstack/react-router'
import AddValue from '../../pages/cards/AddValue'

export const Route = createFileRoute('/cards/add')({
  component: () => <AddValue onBack={() => window.history.back()} />,
})

