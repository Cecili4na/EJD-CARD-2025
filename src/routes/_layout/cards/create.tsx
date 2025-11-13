// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import CreateCard from '../../../pages/cards/CreateCard'

export const Route = createFileRoute('/_layout/cards/create')({
  component: CreateCard,
})
