import { useState, ReactNode } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Header, Button } from '../shared'
import { TabNavigation } from '../ui'

interface AppLayoutProps {
  children?: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [, setUser] = useState<{ email: string; password: string } | null>(null)

  // Determinar aba ativa baseada na rota
  const getActiveTab = () => {
    const path = location.pathname
    if (path.startsWith('/cards')) return 'cards'
    if (path.startsWith('/lojinha')) return 'lojinha'
    if (path.startsWith('/lanchonete')) return 'lanchonete'
    return 'cards'
  }

  const handleTabChange = (tab: 'cards' | 'lojinha' | 'lanchonete') => {
    navigate(`/${tab}`)
  }

  const handleLogout = () => {
    setUser(null)
    navigate('/login')
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
          {/* Botão de Logout */}
          <div className="flex justify-end mb-4">
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-wizard-500 text-wizard-500 hover:bg-wizard-500 hover:text-black"
            >
              🚪 Sair
            </Button>
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