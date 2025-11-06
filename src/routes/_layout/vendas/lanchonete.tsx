import { createFileRoute } from '@tanstack/react-router'
import VendasLanchonete from '../../../pages/vendas/VendasLanchonete'

export const Route = createFileRoute('/_layout/vendas/lanchonete')({
  component: VendasLanchonete,
})
