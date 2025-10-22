import { useNavigate, useLocation } from 'react-router-dom'
import { Card, Button } from '../../components/shared'

const ProductsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Determinar o contexto baseado na rota (lojinha ou lanchonete)
  const context = location.pathname.startsWith('/lojinha') ? 'lojinha' : 'lanchonete'
  
  // Configurações específicas por contexto
  const config = {
    lojinha: {
      title: 'Produtos da Lojinha',
      icon: '🛍️',
      color: 'purple',
      createLabel: 'Cadastrar Produto',
      listLabel: 'Listar Produtos',
      createDescription: 'Adicione novos produtos da lojinha',
      listDescription: 'Visualize todos os produtos da lojinha'
    },
    lanchonete: {
      title: 'Cardápio da Lanchonete',
      icon: '🍔',
      color: 'orange',
      createLabel: 'Cadastrar Item',
      listLabel: 'Listar Cardápio',
      createDescription: 'Adicione novos itens ao cardápio',
      listDescription: 'Visualize todos os itens do cardápio'
    }
  }
  
  const currentConfig = config[context]
  const colorClasses: Record<string, {
    from: string
    to: string
    border: string
    bg: string
    hover: string
    shadow: string
  }> = {
    purple: {
      from: 'from-purple-50',
      to: 'to-purple-100',
      border: 'border-purple-200',
      bg: 'bg-purple-500',
      hover: 'hover:bg-purple-600',
      shadow: 'hover:shadow-purple-200'
    },
    orange: {
      from: 'from-orange-50',
      to: 'to-orange-100',
      border: 'border-orange-200',
      bg: 'bg-orange-500',
      hover: 'hover:bg-orange-600',
      shadow: 'hover:shadow-orange-200'
    }
  }
  
  const colors = colorClasses[currentConfig.color]

  return (
    <div className="space-y-6">
      {/* Cards de Funcionalidades de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Cadastrar Produto/Item */}
        <Card className={`bg-gradient-to-br ${colors.from} ${colors.to} ${colors.border} hover:shadow-lg transition-shadow duration-300 cursor-pointer`} onClick={() => navigate(`/${context}/products/create`)}>
          <div className="text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              {currentConfig.createLabel}
            </h3>
            <p className="text-black-700 mb-4 font-farmhand">
              {currentConfig.createDescription}
            </p>
            <Button 
              size="lg"
              className={`${colors.bg} ${colors.hover} !text-sky-900 shadow-lg ${colors.shadow}`}
            >
              📦 {currentConfig.createLabel}
            </Button>
          </div>
        </Card>
        
        {/* Listar Produtos/Cardápio */}
        <Card className={`bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer`} onClick={() => navigate(`/${context}/products/list`)}>
          <div className="text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              {currentConfig.listLabel}
            </h3>
            <p className="text-black-700 mb-4 font-farmhand">
              {currentConfig.listDescription}
            </p>
            <Button 
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 !text-sky-900 shadow-lg hover:shadow-blue-200"
            >
              📋 {currentConfig.listLabel}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ProductsPage

