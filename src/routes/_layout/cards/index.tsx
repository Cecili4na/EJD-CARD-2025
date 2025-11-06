import { createFileRoute } from '@tanstack/react-router'
import CardsPage from '../../../pages/cards/CardsPage'
import { cardKeys } from '../../../hooks/useCards'
import { cardsApi } from '../../../api/cards.api'

export const Route = createFileRoute('/_layout/cards/')({
  component: CardsPage,
  loader: async ({ context }) => {
    // Pre-fetch all cards
    await context.queryClient.ensureQueryData({
      queryKey: cardKeys.lists(),
      queryFn: cardsApi.getAll,
    })
  },
})
