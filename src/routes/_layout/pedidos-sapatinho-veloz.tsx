// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import SapatinhoVelozOrdersPage from '../../pages/sapatinho-veloz/SapatinhoVelozOrdersPage'

export const Route = createFileRoute('/_layout/pedidos-sapatinho-veloz')({
  component: SapatinhoVelozOrdersPage,
})

