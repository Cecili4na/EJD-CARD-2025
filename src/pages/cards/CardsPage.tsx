import { useNavigate } from '@tanstack/react-router'
import { Card, Button, Header } from '../../components/shared'

const CardsPage = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <Header 
            title="🔍 Comunicação"
            subtitle="Crie e gerencie seus cartões mágicos"
            showLogo={false}
            showBackButton={false}
          />
      {/* Cards de Funcionalidades de Cartões */}
      <Header 
            title="💳 Cartões Mágicos"
            subtitle="Gerencie seus cartões de débito mágicos"
            showLogo={false}
        />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Criar Cartão */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate({ to: '/cards/create' as any, search: {} as any })}>
          <div className="text-center">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              Criar Cartão
            </h3>
            <p className="text-black-700 mb-4 font-farmhand">
              Emita um novo cartão de débito mágico
            </p>
            <Button 
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-200"
              onClick={(event) => {
                event.stopPropagation()
                navigate({ to: '/cards/create' as any, search: {} as any })
              }}
            >
              💳 Criar Novo Cartão
            </Button>
          </div>
        </Card>
        
        {/* Consultar Saldo */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate({ to: '/cards/balance' as any, search: {} as any })}>
          <div className="text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              Consultar Saldo
            </h3>
            <p className="text-black-700 mb-4 font-farmhand">
              Verifique o saldo do seu cartão
            </p>
            <Button 
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-yellow-200"
              onClick={(event) => {
                event.stopPropagation()
                navigate({ to: '/cards/balance' as any, search: {} as any })
              }}
            >
              🔍 Consultar Saldo
            </Button>
          </div>
        </Card>

        {/* Inserir Valor */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate({ to: '/cards/add' as any, search: {} as any })}>
          <div className="text-center">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              Inserir Valor
            </h3>
            <p className="text-black-700 mb-4 font-farmhand">
              Adicione valor ao seu cartão
            </p>
            <Button 
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-200"
              onClick={(event) => {
                event.stopPropagation()
                navigate({ to: '/cards/add' as any, search: {} as any })
              }}
            >
              💰 Inserir Valor
            </Button>
          </div>
        </Card>

        {/* Debitar Cartão */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate({ to: '/cards/debit' as any, search: {} as any })}>
          <div className="text-center">
            <div className="text-5xl mb-4">💸</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              Debitar Cartão
            </h3>
            <p className="text-black-700 mb-4 font-farmhand">
              Realize um débito no seu cartão
            </p>
            <Button 
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-200"
              onClick={(event) => {
                event.stopPropagation()
                navigate({ to: '/cards/debit' as any, search: {} as any })
              }}
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