import { ReactNode } from 'react'
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { Header, Button } from '../shared'
import { TabNavigation } from '../ui'
import { useAuth } from '../../contexts/AuthContext'

const AppLayout = () => {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const { user, logout } = useAuth()

  const isInListPage = location.pathname.endsWith('/products')
  // Verificar se está em páginas de produtos
  const isInProductsPage = location.pathname.endsWith('/products')
  
  // Verificar se está em página de formulário (create/edit) ou listagem
  const isInFormPage = location.pathname.includes('/products/create') || 
                       location.pathname.includes('/edit')
  
  // Verificar se está em subpágina de produtos (não na página principal /products)
  const isInProductsSubpage = isInFormPage || isInListPage
  
  // Determinar o contexto (lojinha ou lanchonete) para o botão de voltar
  const getBackContext = (): 'lojinha' | 'lanchonete' | 'sapatinho-veloz' => {
    if (location.pathname.startsWith('/lojinha')) return 'lojinha'
    if (location.pathname.startsWith('/lanchonete')) return 'lanchonete'
    if (location.pathname.startsWith('/sapatinho-veloz')) return 'sapatinho-veloz'
    return 'lojinha'
  }

  // Determinar aba ativa baseada na rota
  const getActiveTab = () => {
    const path = routerState.location.pathname
    if (path.startsWith('/mycard')) return 'mycard'
    if (path.startsWith('/cards')) return 'cards'
    if (path.startsWith('/lojinha')) return 'lojinha'
    if (path.startsWith('/lanchonete')) return 'lanchonete'
    if (path.startsWith('/admin')) return 'admin'
    if (path.startsWith('/sapatinho-veloz')) return 'sapatinho-veloz'
    return 'mycard'
  }

  const handleTabChange = (tab: 'cards' | 'lojinha' | 'lanchonete' | 'admin' | 'mycard' | 'sapatinho-veloz') => {
    navigate({ to: `/${tab}` as any, search: {} as any })
  }

  const handleBackToContext = () => {
    const context = getBackContext()
    // Se estiver em subpágina de produtos (create/edit/list), volta para /products
    // Caso contrário, volta para a página principal do contexto
    if (isInFormPage || isInListPage) {
      navigate({to: `/${context}/select`})
    } else if (isInListPage) {
      navigate({to: `/${context}/select`})
    }
    else {
      navigate(`/${context}`)
    }
  }

  // Determinar texto do botão de voltar
  const getBackButtonText = (): string => {
    const context = getBackContext()
    const contextName = context === 'lojinha'
      ? 'Lojinha'
      : context === 'lanchonete'
        ? 'Lanchonete'
        : 'Sapatinho Veloz'
    
    if (isInProductsSubpage) {
      return `← Voltar para Gerenciar Produtos`
    }
    return `← Voltar para ${contextName}`
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
          <div className="flex justify-between items-center mb-6">
            <div className="text-base text-gray-800">
              👋 Olá, <span className="font-bold text-black text-lg">{user?.name || user?.email}</span>
              <span className="ml-3 px-3 py-1.5 bg-emerald-200 text-emerald-900 rounded-full text-sm font-bold border border-emerald-400">
                {user?.role === 'admin' ? '👑 Admin' : 
                 user?.role === 'genios_card' ? '🎯 Genios Card' :
                 user?.role === 'coord_lojinha' ? '🏪 Coord Lojinha' :
                 user?.role === 'coord_lanchonete' ? '🍔 Coord Lanchonete' :
                 user?.role === 'comunicacao' ? '📢 Comunicação' :
                 user?.role === 'vendedor_lojinha' ? '🛒 Vendedor Lojinha' :
                 user?.role === 'vendedor_lanchonete' ? '🍔 Vendedor Lanchonete' :
                 user?.role === 'entregador_lojinha' ? '🚚 Entregador' :
                 user?.role === 'encontrista' ? '👤 Encontrista' : '👻 Guest'}
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
            </div>
          </div>
          
          <Header 
            subtitle="Encontrão 2025 - O Mágico de Oz" 
          />

          {/* Navegação por Abas */}
          <TabNavigation activeTab={getActiveTab()} onTabChange={handleTabChange} />
          
          {/* Botão de Voltar (apenas em páginas de produtos) */}
          {isInProductsPage && (
            <div className="flex justify-start mb-8 mt-4">
              <Button
                onClick={handleBackToContext}
                variant="outline"
                size="sm"
                className="border-emerald-500 !text-black hover:bg-emerald-200 hover:!text-black font-semibold font-cardinal shadow-md"
              >
                {getBackButtonText()}
              </Button>
            </div>
          )}
          
          {/* Conteúdo das rotas */}
          <div className={isInProductsPage ? "mt-0" : "mt-8"}>
            {<Outlet />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppLayout