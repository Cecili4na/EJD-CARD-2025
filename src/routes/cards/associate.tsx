import { createFileRoute } from '@tanstack/react-router'
import AssociateCard from '../../pages/cards/AssociateCard'

export const Route = createFileRoute('/cards/associate')({
  component: AssociateCard,
})
