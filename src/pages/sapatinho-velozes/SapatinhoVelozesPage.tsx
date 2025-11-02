import { useState } from 'react'
import { Card, Button } from '../../components/shared'
import SapatinhoVelozesStore from './SapatinhoVelozesStore'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
}

const SapatinhoVelozesPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [showStore, setShowStore] = useState(false)

  const handleCreateProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    setProducts(prev => [...prev, newProduct])
  }

  const handleEditProduct = (productId: string, productData: Omit<Product, 'id'>) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...productData, id: p.id } : p
    ))
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId))
  }

  if (showStore) {
    return (
      <SapatinhoVelozesStore
        products={products}
        onCreateProduct={handleCreateProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onBack={() => setShowStore(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gerenciar Produtos */}
        <Card className="bg-gradient-to-br from-ruby-50 to-ruby-100 border-ruby-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => setShowStore(true)}>
          <div className="text-center">
            <div className="text-4xl mb-4">👟</div>
            <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
              Gerenciar Produtos
            </h3>
            <p className="text-black mb-4">
              Cadastre, edite e visualize produtos do delivery
            </p>
            <Button 
              size="lg"
              className="bg-ruby-500 hover:bg-ruby-600 text-black shadow-lg hover:shadow-ruby-200"
            >
              👟 Gerenciar Produtos
            </Button>
          </div>
        </Card>
        
        {/* Vendas */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => setShowStore(true)}>
          <div className="text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
              Vendas
            </h3>
            <p className="text-black mb-4">
              Processe vendas e gere IDs únicos para cada pedido
            </p>
            <Button 
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg hover:shadow-emerald-200"
            >
              💰 Vendas
            </Button>
          </div>
        </Card>
      </div>

      {/* Informações adicionais */}
      <Card className="bg-gradient-to-br from-wizard-50 to-wizard-100 border-wizard-200">
        <h3 className="text-xl font-semibold text-black mb-4 font-cardinal text-center">
          ✨ Sapatinho Velozes - Delivery de Calçados
        </h3>
        <p className="text-black text-center mb-4">
          Sistema completo de gestão de vendas com identificação única para cada pedido.
          Gerencie produtos, processe vendas e acompanhe o histórico de forma rápida e eficiente.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="text-center bg-white/50 rounded-lg p-4">
            <div className="text-3xl mb-2">👟</div>
            <p className="font-semibold text-black">Produtos</p>
            <p className="text-sm text-black">Cadastro completo</p>
          </div>
          <div className="text-center bg-white/50 rounded-lg p-4">
            <div className="text-3xl mb-2">🛒</div>
            <p className="font-semibold text-black">Vendas</p>
            <p className="text-sm text-black">Com ID único</p>
          </div>
          <div className="text-center bg-white/50 rounded-lg p-4">
            <div className="text-3xl mb-2">📊</div>
            <p className="font-semibold text-black">Histórico</p>
            <p className="text-sm text-black">Total detalhado</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SapatinhoVelozesPage
