import { useNavigate } from 'react-router-dom'
import { Card, Button } from '../../components/shared'

const LojinhaPage = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Cards de Funcionalidades da Lojinha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gerenciar Produtos */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/lojinha/products')}>
          <div className="text-center">
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              Gerenciar Produtos
            </h3>
            <p className="text-black-700 mb-4 font-farmhand">
              Cadastre, edite e visualize produtos da lojinha
            </p>
            <Button 
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:shadow-emerald-200"
            >
              🛍️ Gerenciar Produtos
            </Button>
          </div>
        </Card>
        
        {/* Vendas */}
        <Card className="bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/lojinha/sales')}>
          <div className="text-center">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              Vendas
            </h3>
            <p className="text-black-700 mb-4 font-farmhand">
              Processe vendas e gerencie o caixa
            </p>
            <Button 
              size="lg"
              className="bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-emerald-200"
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