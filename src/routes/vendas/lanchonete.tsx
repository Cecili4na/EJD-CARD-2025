import { createFileRoute } from '@tanstack/react-router'
import VendasLanchonete from '../../pages/vendas/VendasLanchonete'

export const Route = createFileRoute('/vendas/lanchonete')({
  component: VendasLanchonete,
})
