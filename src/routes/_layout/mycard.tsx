// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import MyCardPage from '../../pages/MyCardPage'

export const Route = createFileRoute('/_layout/mycard')({
  component: MyCardPage,
})

