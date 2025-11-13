// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { ProductsPage } from '../../../pages/products'

export const Route = createFileRoute('/_layout/lojinha/select')({
  component: ProductsPage,
})

