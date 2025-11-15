// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { SalesPage } from '../../../pages/sales'

export const Route = createFileRoute('/_layout/vendas/lanchonete')({
  component: SalesPage,
})
