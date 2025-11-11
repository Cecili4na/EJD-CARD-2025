import { createFileRoute } from '@tanstack/react-router'
import { CreateProductPage } from '../../../../pages/products'

export const Route = createFileRoute('/_layout/sapatinho-veloz/products/create')({
  component: () => <CreateProductPage onBack={() => window.history.back()} />,
})


