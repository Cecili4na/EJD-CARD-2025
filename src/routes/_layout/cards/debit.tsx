// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import DebitCard from '../../../pages/cards/DebitCard'

export const Route = createFileRoute('/_layout/cards/debit')({
  component: DebitCard,
})
