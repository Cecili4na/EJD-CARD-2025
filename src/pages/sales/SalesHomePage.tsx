import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Header, Card, Button } from '../../components/shared'

type ContextType = 'lojinha' | 'lanchonete'

const SalesHomePage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const context: ContextType = location.pathname.startsWith('/lojinha') ? 'lojinha' : 'lanchonete'

  const isLojinha = context === 'lojinha'
  const title = isLojinha ? '🛍️ VENDAS' : '🍔 PEDIDOS'
  const subtitle = isLojinha ? 'Escolha uma opção' : 'Escolha uma opção'

  const goToNew = () => navigate(isLojinha ? '/lojinha/sales/new' : '/lanchonete/orders/new')
  const goToHistory = () => navigate(isLojinha ? '/lojinha/sales/history' : '/lanchonete/orders/history')

  return (
    <div className="space-y-6">
      <Header title={title} subtitle={subtitle} showLogo={false} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={goToNew}>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">{isLojinha ? '🛍️' : '🍔'}</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              {isLojinha ? 'Realizar Venda' : 'Realizar Pedido'}
            </h3>
            <p className="text-black-700 mb-4 font-farmhand">
              {isLojinha ? 'Selecione produtos e finalize uma venda' : 'Selecione itens e finalize um pedido'}
            </p>
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:shadow-emerald-200">
              {isLojinha ? '🛍️ Nova Venda' : '🍔 Novo Pedido'}
            </Button>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={goToHistory}>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">🧾</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              Visualizar Histórico
            </h3>
            <p className="text-black-700 mb-4 font-farmhand">
              Consulte as vendas/pedidos já realizados
            </p>
            <Button size="lg" className="bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-sky-200">
              🧾 Ver Histórico
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SalesHomePage


