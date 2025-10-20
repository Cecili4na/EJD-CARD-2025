import { useNavigate } from 'react-router-dom'
import { Card, Button } from '../../components/shared'

const CardsPage = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Cards de Funcionalidades de Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Criar Cartão */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/cards/create')}>
          <div className="text-center">
            <div className="text-4xl mb-4">🏦</div>
            <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
              Criar Cartão
            </h3>
            <p className="text-black mb-4 font-farmhand">
              Emita um novo cartão de débito mágico
            </p>
            <Button 
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 !text-black shadow-lg hover:shadow-emerald-200"
            >
              🏦 Criar Novo Cartão
            </Button>
          </div>
        </Card>
        
        {/* Consultar Saldo */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/cards/balance')}>
          <div className="text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
              Consultar Saldo
            </h3>
            <p className="text-black mb-4 font-farmhand">
              Verifique o saldo do seu cartão
            </p>
            <Button 
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 !text-black shadow-lg hover:shadow-yellow-200"
            >
              💰 Consultar Saldo
            </Button>
          </div>
        </Card>

        {/* Inserir Valor */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/cards/add')}>
          <div className="text-center">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
              Inserir Valor
            </h3>
            <p className="text-black mb-4 font-farmhand">
              Adicione valor ao seu cartão
            </p>
            <Button 
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 !text-black shadow-lg hover:shadow-blue-200"
            >
              💳 Inserir Valor
            </Button>
          </div>
        </Card>

        {/* Debitar Cartão */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/cards/debit')}>
          <div className="text-center">
            <div className="text-4xl mb-4">💸</div>
            <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
              Debitar Cartão
            </h3>
            <p className="text-black mb-4 font-farmhand">
              Realize um débito no seu cartão
            </p>
            <Button 
              size="lg"
              className="bg-red-500 hover:bg-red-600 !text-black shadow-lg hover:shadow-red-200"
            >
              💸 Debitar Cartão
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CardsPage