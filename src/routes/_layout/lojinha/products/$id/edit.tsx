import { createFileRoute } from '@tanstack/react-router'
import { CreateProductPage } from '../../../../../pages/products'

export const Route = createFileRoute('/_layout/lojinha/products/$id/edit')({
  component: () => <CreateProductPage onBack={() => window.history.back()} />,
})

