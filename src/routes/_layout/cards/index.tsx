// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import CardsPage from '../../../pages/cards/CardsPage'
import { cardKeys } from '../../../hooks/useCards'
import { cardsApi } from '../../../api/cards.api'
import type { RouterContext } from '../../../router'

export const Route = createFileRoute('/_layout/cards/')({
  component: CardsPage,
  loader: async ({ context }: { context: RouterContext }) => {
    await context.queryClient.ensureQueryData({
      queryKey: cardKeys.lists(),
      queryFn: cardsApi.getAll,
    })
  },
})
