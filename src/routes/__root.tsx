import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useAuth } from '../contexts/AuthContext'

// Componente que decide o Layout a ser usado
function RootLayout() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // 1. Loading
  if (isLoading) return <div>Carregando...</div>

  if (!user && !location.pathname.startsWith('/login')) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Você não está logado. Por favor, acesse a <a href="/login">página de login</a>.
        </div>
      )
  }
  
  return <Outlet />
}


export const Route = createRootRoute({
  component: () => (
    <RootLayout />
  ),
})