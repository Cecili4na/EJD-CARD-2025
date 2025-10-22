import { useNavigate } from 'react-router-dom'
import { Card, Button } from '../../components/shared'

const LanchonetePage = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Cards de Funcionalidades da Lanchonete */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gerenciar Cardápio */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/lanchonete/products')}>
          <div className="text-center">
            <div className="text-5xl mb-4">🍔</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              Gerenciar Cardápio
            </h3>
            <p className="text-black mb-4">
              Cadastre, edite e visualize itens do cardápio
            </p>
            <Button 
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:shadow-emerald-200"
            >
              🍔 Gerenciar Cardápio
            </Button>
          </div>
        </Card>
        
        {/* Pedidos */}
        <Card className="bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/lanchonete/orders')}>
          <div className="text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              Pedidos
            </h3>
            <p className="text-black mb-4">
              Processe pedidos e gerencie a cozinha
            </p>
            <Button 
              size="lg"
              className="bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-sky-200"
            >
              📋 Pedidos
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LanchonetePage