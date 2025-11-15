// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { LojinhaOrdersPage } from '../../pages/lojinha'

export const Route = createFileRoute('/_layout/pedidos-lojinha')({
  component: LojinhaOrdersPage,
})
