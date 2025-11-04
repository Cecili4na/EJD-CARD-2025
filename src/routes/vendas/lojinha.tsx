import { createFileRoute } from '@tanstack/react-router'
import VendasLojinha from '../../pages/vendas/VendasLojinha'

export const Route = createFileRoute('/vendas/lojinha')({
  component: VendasLojinha,
})
