import { ReactNode } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Header, Button } from '../shared'
import { TabNavigation } from '../ui'
import { useAuth } from '../../contexts/AuthContext'

interface AppLayoutProps {
  children?: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  // Determinar aba ativa baseada na rota
  const getActiveTab = () => {
    const path = location.pathname
    if (path.startsWith('/mycard')) return 'mycard'
    if (path.startsWith('/cards')) return 'cards'
    if (path.startsWith('/lojinha')) return 'lojinha'
    if (path.startsWith('/lanchonete')) return 'lanchonete'
    if (path.startsWith('/admin')) return 'admin'
    return 'mycard'
  }

  const handleTabChange = (tab: 'cards' | 'lojinha' | 'lanchonete' | 'admin' | 'mycard') => {
    navigate(`/${tab}`)
  }

  const handleLogout = async () => {
    try {
      console.log('Iniciando logout...')
      await logout()
      console.log('Logout concluído')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

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
          {/* Header com informações do usuário e logout */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              👋 Olá, <span className="font-semibold text-black">{user?.name || user?.email}</span>
              <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                {user?.role === 'admin' ? '👑 Admin' : 
                 user?.role === 'manager' ? '👨‍💼 Manager' : 
                 user?.role === 'user' ? '👤 User' : '👻 Guest'}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-wizard-500 text-wizard-500 hover:bg-wizard-500 hover:text-black"
              >
                🚪 Sair
              </Button>
              <Button 
                onClick={() => {
                  localStorage.clear()
                  window.location.href = '/'
                }}
                variant="outline"
                size="sm"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
              >
                🔄 Logout Simples
              </Button>
            </div>
          </div>
          
          <Header 
            subtitle="Encontrão 2025 - O Mágico de Oz" 
          />

          {/* Navegação por Abas */}
          <TabNavigation activeTab={getActiveTab()} onTabChange={handleTabChange} />
          
          {/* Conteúdo das rotas */}
          <div className="mt-8">
            {children || <Outlet />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppLayout