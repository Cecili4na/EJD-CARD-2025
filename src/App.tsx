import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Login } from './components/ui'
import AppLayout from './components/layouts/AppLayout'
import { CardsRouter } from './pages/cards'
import { LojinhaPage } from './pages/lojinha'
import { LanchonetePage } from './pages/lanchonete'
import AdminPage from './pages/admin/AdminPage'
import VendasLojinha from './pages/vendas/VendasLojinha'
import VendasLanchonete from './pages/vendas/VendasLanchonete'
import MyCardPage from './pages/MyCardPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { SupabaseDataProvider } from './contexts/SupabaseDataContext'
import { ToastProvider } from './contexts/ToastContext'
import { isSupabaseConfigured } from './lib/supabase'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { queryClient } from './lib/query-client'
import { ProductsPage, CreateProductPage, ListProductsPage } from './pages/products'

function AppContent() {
  const { user, isLoading } = useAuth()

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

  if (!user) {
    return (
      <div className="min-h-screen w-full relative" style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #fef3c7 25%, #faf5ff 50%, #f0f9ff 75%, #fdf2f8 100%)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Bordas decorativas douradas */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-yellow-400 rounded-br-lg z-20"></div>
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-yellow-400 rounded-bl-lg z-20"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-8 border-b-4 border-yellow-400 rounded-t-lg z-20"></div>
        
        <div className="w-full px-4 py-8 relative z-10">
          <div className="max-w-4xl mx-auto w-full">
            <Login />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/mycard" replace />} />
        <Route path="/login" element={<Navigate to="/mycard" replace />} />
            <Route path="/*" element={
              <AppLayout>
                <Routes>
                  <Route path="/mycard" element={<MyCardPage />} />
                  <Route path="/cards/*" element={
                    <ProtectedRoute requiredPermission="canViewCards">
                      <CardsRouter />
                    </ProtectedRoute>
                  } />
                  <Route path="/lojinha" element={
                    <ProtectedRoute requiredPermission="canSellLojinha">
                      <LojinhaPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/lanchonete" element={
                    <ProtectedRoute requiredPermission="canSellLanchonete">
                      <LanchonetePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute requiredPermission="canViewAdmin" showAccessDenied>
                      <AdminPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </AppLayout>
            } />
            <Route path="/vendas/lojinha" element={
              <AppLayout>
                <ProtectedRoute requiredPermission="canSellLojinha">
                  <VendasLojinha />
                </ProtectedRoute>
              </AppLayout>
            } />
            <Route path="/vendas/lanchonete" element={
              <AppLayout>
                <ProtectedRoute requiredPermission="canSellLanchonete">
                  <VendasLanchonete />
                </ProtectedRoute>
              </AppLayout>
            } />
            <Route path="/pedidos-lojinha" element={
              <AppLayout>
                <ProtectedRoute requiredPermission="canViewOpenOrders">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8 text-center">
                    <h2 className="text-2xl font-bold text-black mb-4">📦 Pedidos Lojinha</h2>
                    <p className="text-gray-600">Tela de pedidos em desenvolvimento...</p>
                  </div>
                </ProtectedRoute>
              </AppLayout>
            } />
            <Route path="/historico/lojinha" element={
              <AppLayout>
                <ProtectedRoute requiredPermission="canViewSalesHistoryLojinha">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8 text-center">
                    <h2 className="text-2xl font-bold text-black mb-4">📊 Histórico Lojinha</h2>
                    <p className="text-gray-600">Tela de histórico em desenvolvimento...</p>
                  </div>
                </ProtectedRoute>
              </AppLayout>
            } />
            <Route path="/historico/lanchonete" element={
              <AppLayout>
                <ProtectedRoute requiredPermission="canViewSalesHistoryLanchonete">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8 text-center">
                    <h2 className="text-2xl font-bold text-black mb-4">📊 Histórico Lanchonete</h2>
                    <p className="text-gray-600">Tela de histórico em desenvolvimento...</p>
                  </div>
                </ProtectedRoute>
              </AppLayout>
            } />
      </Routes>
    </Router>
  )
}

function App() {
  // Escolher provider baseado na configuração do Supabase
  const DataProviderComponent = isSupabaseConfigured() ? SupabaseDataProvider : DataProvider

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProviderComponent>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </DataProviderComponent>
      </AuthProvider>
      {/* DevTools apenas em desenvolvimento */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default App