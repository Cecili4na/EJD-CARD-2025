import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { Login } from './components/ui'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { SupabaseDataProvider } from './contexts/SupabaseDataContext'
import { ToastProvider } from './contexts/ToastContext'
import { isSupabaseConfigured } from './lib/supabase'
import { queryClient } from './lib/query-client'
import { CheckoutForm } from './components/CheckoutForm'

const DataProviderComponent = isSupabaseConfigured() ? SupabaseDataProvider : DataProvider
const isCheckoutPath = () => typeof window !== 'undefined' && window.location.pathname.startsWith('/checkout')

function AppContent() {
  const { user, isLoading } = useAuth()

  // Checkout liberado mesmo sem login; serverless assegura segredo.
  if (isCheckoutPath()) {
    return (
      <DataProviderComponent>
        <ToastProvider>
          <CheckoutForm />
        </ToastProvider>
      </DataProviderComponent>
    )
  }

  if (isLoading) return <div>Carregando...</div>
  if (!user) return <Login /> 

  return (
    <DataProviderComponent>
      <ToastProvider>
          <RouterProvider router={router} />
      </ToastProvider>
    </DataProviderComponent>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <AppContent />
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
