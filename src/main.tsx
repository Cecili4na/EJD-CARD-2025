import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { router } from './router'
import { queryClient } from './lib/query-client'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { SupabaseDataProvider } from './contexts/SupabaseDataContext'
import { ToastProvider } from './contexts/ToastContext'
import { isSupabaseConfigured } from './lib/supabase'
import './index.css'
import './global.css'

// Componente que atualiza o contexto do router quando o user muda
function RouterUpdater() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Atualizar o contexto do router quando o user muda
    router.update({
      context: {
        queryClient,
        user: user || null,
      },
    })
  }, [user])

  // Mostrar loading enquanto autenticação está carregando
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #fef3c7 25%, #faf5ff 50%, #f0f9ff 75%, #fdf2f8 100%)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return <RouterProvider router={router} />
}

function App() {
  // Escolher provider baseado na configuração do Supabase
  const DataProviderComponent = isSupabaseConfigured() ? SupabaseDataProvider : DataProvider

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProviderComponent>
          <ToastProvider>
            <RouterUpdater />
          </ToastProvider>
        </DataProviderComponent>
      </AuthProvider>
      {/* DevTools apenas em desenvolvimento */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

// Renderizar a aplicação
const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
