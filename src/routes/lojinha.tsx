import { createFileRoute } from '@tanstack/react-router'
import { LojinhaPage } from '../pages/lojinha'
import { productKeys } from '../hooks/useProducts'
import { productsApi } from '../api/products.api'

export const Route = createFileRoute('/lojinha')({
  component: LojinhaPage,
  loader: async ({ context }) => {
    // Pre-fetch lojinha products
    await context.queryClient.ensureQueryData({
      queryKey: productKeys.list('lojinha'),
      queryFn: () => productsApi.getAll('lojinha'),
    })
  },
})
