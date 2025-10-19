import { useNavigate } from 'react-router-dom'
import { Card, Button } from '../../components/shared'

const LanchonetePage = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Cards de Funcionalidades da Lanchonete */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gerenciar Cardápio */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/lanchonete/menu')}>
          <div className="text-center">
            <div className="text-4xl mb-4">🍔</div>
            <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
              Gerenciar Cardápio
            </h3>
            <p className="text-black mb-4">
              Cadastre, edite e visualize itens do cardápio
            </p>
            <Button 
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-black shadow-lg hover:shadow-orange-200"
            >
              🍔 Gerenciar Cardápio
            </Button>
          </div>
        </Card>
        
        {/* Pedidos */}
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/lanchonete/orders')}>
          <div className="text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
              Pedidos
            </h3>
            <p className="text-black mb-4">
              Processe pedidos e gerencie a cozinha
            </p>
            <Button 
              size="lg"
              className="bg-pink-500 hover:bg-pink-600 text-black shadow-lg hover:shadow-pink-200"
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