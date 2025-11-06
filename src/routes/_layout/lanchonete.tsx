import { createFileRoute } from '@tanstack/react-router'
import { LanchonetePage } from '../../pages/lanchonete'
import { productKeys } from '../../hooks/useProducts'
import { productsApi } from '../../api/products.api'

export const Route = createFileRoute('/_layout/lanchonete')({
  component: LanchonetePage,
  loader: async ({ context }) => {
    // Pre-fetch lanchonete products
    await context.queryClient.ensureQueryData({
      queryKey: productKeys.list('lanchonete'),
      queryFn: () => productsApi.getAll('lanchonete'),
    })
  },
})
