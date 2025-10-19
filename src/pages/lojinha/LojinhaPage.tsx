import { useNavigate } from 'react-router-dom'
import { Card, Button } from '../../components/shared'

const LojinhaPage = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Cards de Funcionalidades da Lojinha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gerenciar Produtos */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/lojinha/products')}>
          <div className="text-center">
            <div className="text-4xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
              Gerenciar Produtos
            </h3>
            <p className="text-black mb-4">
              Cadastre, edite e visualize produtos da lojinha
            </p>
            <Button 
              size="lg"
              className="bg-purple-500 hover:bg-purple-600 text-black shadow-lg hover:shadow-purple-200"
            >
              🛍️ Gerenciar Produtos
            </Button>
          </div>
        </Card>
        
        {/* Vendas */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/lojinha/sales')}>
          <div className="text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
              Vendas
            </h3>
            <p className="text-black mb-4">
              Processe vendas e gerencie o caixa
            </p>
            <Button 
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-black shadow-lg hover:shadow-green-200"
            >
              💰 Vendas
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LojinhaPage