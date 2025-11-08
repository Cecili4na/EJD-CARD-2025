import { createFileRoute } from '@tanstack/react-router'
import { ProductsPage } from '../../../pages/products'

export const Route = createFileRoute('/_layout/sapatinho-veloz/select')({
  component: () => <ProductsPage onBack={() => window.history.back()} />,
})


