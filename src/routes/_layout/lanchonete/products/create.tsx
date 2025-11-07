import { createFileRoute } from '@tanstack/react-router'
import { CreateProductPage } from '../../../../pages/products'

export const Route = createFileRoute('/_layout/lanchonete/products/create')({
  component: () => <CreateProductPage onBack={() => window.history.back()} />,
})

