import { useNavigate } from '@tanstack/react-router'
import { Card, Button, Header } from '../../components/shared'

const LojinhaPage = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <Header 
            title="🛍️ Lojinha Mágica"
            subtitle="Gerencie os produtos e vendas da lojinha"
            showLogo={false}
        />
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
              className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-200"
              onClick={(e) => {
                e.stopPropagation(); 
                navigate({ to: '/lojinha/select' });
              }}
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
              className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg hover:shadow-emerald-200"
            >
              💰 Vendas
            </Button>
          </div>
        </Card>

        {/* Gerenciar Produtos - Sapatinho Veloz */}
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/sapatinho-veloz/products')}>
          <div className="text-center">
            <div className="text-5xl mb-4">👠</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              Gerenciar Produtos Sapatinho
            </h3>
            <p className="text-black-700 mb-4 font-farmhand">
              Cadastre, edite e visualize itens exclusivos do Sapatinho Veloz
            </p>
            <Button 
              size="lg"
              className="bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-pink-200"
              onClick={(e) => {
                e.stopPropagation();
                navigate({ to: '/sapatinho-veloz/select' });
              }}
            >
              👠 Produtos Sapatinho
            </Button>
          </div>
        </Card>

        {/* Vendas - Sapatinho Veloz */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/sapatinho-veloz/sales')}>
          <div className="text-center">
            <div className="text-5xl mb-4">💜</div>
            <h3 className="text-xl font-semibold text-emerald-600 mb-4 font-cardinal">
              Vendas Sapatinho
            </h3>
            <p className="text-black-700 mb-4 font-farmhand">
              Acompanhe e registre vendas do Sapatinho Mágico
            </p>
            <Button 
              size="lg"
              className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-purple-200"
              onClick={(e) => {
                e.stopPropagation();
                navigate({ to: '/sapatinho-veloz/sales' });
              }}
            >
              💜 Vendas Sapatinho
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LojinhaPage