import { createFileRoute } from '@tanstack/react-router'
import CheckBalance from '../../../pages/cards/CheckBalance'

export const Route = createFileRoute('/_layout/cards/balance')({
  component: () => <CheckBalance onBack={() => window.history.back()} />,
})
