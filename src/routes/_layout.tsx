import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import AppLayout from '../components/layouts/AppLayout'

export const Route = createFileRoute('/_layout')({
  beforeLoad: ({ context }) => {
    // Verificar autenticação no contexto
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
  },
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
