// @ts-nocheck
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/')({
  beforeLoad: () => {
    // Redirect root to mycard page
    throw redirect({ to: '/mycard' })
  },
})

