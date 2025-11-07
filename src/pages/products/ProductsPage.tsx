import { useNavigate, useLocation } from '@tanstack/react-router'
import { Card, Button, Header } from '../../components/shared'

interface ProductsPageProps {
  onBack: () => void
}

const ProductsPage: React.FC<ProductsPageProps> = ({ onBack }) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Determinar o contexto baseado na rota (lojinha ou lanchonete)
  const context = location.pathname.startsWith('/lojinha') ? 'lojinha' : 'lanchonete'
  
  // Configurações específicas por contexto
  const config = {
    lojinha: {
      title: '📦 Produtos da Lojinha',
      color: 'emerald',
      createLabel: 'Cadastrar Produto',
      listLabel: 'Listar Produtos',
      createDescription: 'Adicione novos produtos da lojinha',
      listDescription: 'Visualize todos os produtos da lojinha',
      selectDescription: 'Cadastre, edite e visualize produtos da lojinha'
    },
    lanchonete: {
      title: '📦 Cardápio da Lanchonete',
      color: 'emerald',
      createLabel: 'Cadastrar Item',
      listLabel: 'Listar Cardápio',
      createDescription: 'Adicione novos itens ao cardápio',
      listDescription: 'Visualize todos os itens do cardápio',
      selectDescription: 'Cadastre, edite e visualize itens da lanchonete'
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
    emerald: {
      from: 'from-emerald-50',
      to: 'to-emerald-100',
      border: 'border-emerald-200',
      bg: 'bg-emerald-500',
      hover: 'hover:bg-emerald-600',
      shadow: 'hover:shadow-emerald-200'
    }
  }
  
  const colors = colorClasses[currentConfig.color]

  return (
    <div className="space-y-6">
      <Header 
            title={currentConfig.title}
            subtitle={currentConfig.selectDescription}
            showLogo={false}
        />
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
              className={`${colors.bg} ${colors.hover} text-white shadow-lg ${colors.shadow}`}
              onClick={(e) => {
                e.stopPropagation(); 
                navigate({ to: `/${context}/products/create` });
              }}
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
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-200"
              onClick={(e) => {
                e.stopPropagation(); 
                navigate({ to: `/${context}/products` });
              }}
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

