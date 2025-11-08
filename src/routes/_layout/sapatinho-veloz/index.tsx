import { createFileRoute } from '@tanstack/react-router'
import SapatinhoVelozPage from '../../../pages/sapatinho-veloz/SapatinhoVelozPage'
import { productKeys } from '../../../hooks/useProducts'
import { productsApi } from '../../../api/products.api'

export const Route = createFileRoute('/_layout/sapatinho-veloz/')({
  component: SapatinhoVelozPage,
  loader: async ({ context }: any) => {
    if (context?.queryClient) {
      await context.queryClient.ensureQueryData({
        queryKey: productKeys.list('sapatinho'),
        queryFn: () => productsApi.getAll('sapatinho'),
      })
    }
  },
})


