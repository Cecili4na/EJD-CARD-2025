import { useState, useEffect } from 'react'
import { Card, Button, Header } from '../../components/shared'
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
  const [isLoading, setIsLoading] = useState(true)
  const [animateIn, setAnimateIn] = useState(false)

  // Simulate loading and add entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setAnimateIn(true), 100);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-bounce text-6xl">👟</div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 transition-all duration-700 ease-in-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header with Hero Section */}
      <div className="bg-gradient-to-r from-ruby-500 to-wizard-500 text-white p-8 rounded-xl shadow-xl mb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-cardinal mb-4 text-center">
            👟 Sapatinho Velozes
          </h1>
          <p className="text-xl text-center mb-6">
            Delivery de calçados premium com entrega rápida e garantida
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg"
              className="bg-white text-black hover:bg-ruby-50 shadow-lg hover:shadow-ruby-200 transform hover:scale-105 transition-all duration-300"
              onClick={() => setShowStore(true)}
            >
              Começar Agora
            </Button>
          </div>
        </div>
      </div>

      {/* Cards de Funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Gerenciar Produtos */}
        <Card className="bg-gradient-to-br from-ruby-50 to-ruby-100 border-ruby-200 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer overflow-hidden" onClick={() => setShowStore(true)}>
          <div className="text-center p-6">
            <div className="text-5xl mb-6 transform hover:rotate-12 transition-transform duration-300">👟</div>
            <h3 className="text-2xl font-semibold text-black mb-4 font-cardinal">
              Gerenciar Produtos
            </h3>
            <p className="text-black mb-6">
              Cadastre, edite e visualize produtos do delivery com facilidade e organização
            </p>
            <Button 
              size="lg"
              className="bg-ruby-500 hover:bg-ruby-600 text-black shadow-lg hover:shadow-ruby-200 transform hover:translate-y-[-2px] transition-all duration-300"
            >
              👟 Gerenciar Produtos
            </Button>
          </div>
        </Card>
        
        {/* Vendas */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer overflow-hidden" onClick={() => setShowStore(true)}>
          <div className="text-center p-6">
            <div className="text-5xl mb-6 transform hover:rotate-12 transition-transform duration-300">💰</div>
            <h3 className="text-2xl font-semibold text-black mb-4 font-cardinal">
              Vendas
            </h3>
            <p className="text-black mb-6">
              Processe vendas e gere IDs únicos para cada pedido com sistema intuitivo
            </p>
            <Button 
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg hover:shadow-emerald-200 transform hover:translate-y-[-2px] transition-all duration-300"
            >
              💰 Vendas
            </Button>
          </div>
        </Card>
      </div>

      {/* Informações adicionais */}
      <Card className="bg-gradient-to-br from-wizard-50 to-wizard-100 border-wizard-200 hover:shadow-lg transition-all duration-300">
        <h3 className="text-2xl font-semibold text-black mb-4 font-cardinal text-center">
          ✨ Sapatinho Velozes - Delivery de Calçados
        </h3>
        <p className="text-black text-center mb-6 max-w-3xl mx-auto">
          Sistema completo de gestão de vendas com identificação única para cada pedido.
          Gerencie produtos, processe vendas e acompanhe o histórico de forma rápida e eficiente.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center bg-white/60 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-3 text-ruby-500">👟</div>
            <p className="font-semibold text-black text-lg mb-2">Produtos</p>
            <p className="text-sm text-black">Cadastro completo e organizado</p>
          </div>
          <div className="text-center bg-white/60 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-3 text-emerald-500">🛒</div>
            <p className="font-semibold text-black text-lg mb-2">Vendas</p>
            <p className="text-sm text-black">Com ID único e rastreamento</p>
          </div>
          <div className="text-center bg-white/60 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-3 text-wizard-500">📊</div>
            <p className="font-semibold text-black text-lg mb-2">Histórico</p>
            <p className="text-sm text-black">Total detalhado e exportável</p>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="bg-gray-100 rounded-lg p-6 mt-8 text-center">
        <p className="text-gray-600">© 2025 Sapatinho Velozes - Todos os direitos reservados</p>
        <p className="text-gray-500 text-sm mt-2">Desenvolvido com ❤️ para o Encontrão 2025</p>
      </div>
    </div>
  )
}

export default SapatinhoVelozesPage
