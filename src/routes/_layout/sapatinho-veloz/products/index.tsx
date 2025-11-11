import { createFileRoute } from '@tanstack/react-router'
import { ListProductsPage } from '../../../../pages/products'

export const Route = createFileRoute('/_layout/sapatinho-veloz/products/')({
  component: () => <ListProductsPage onBack={() => window.history.back()} />,
})


