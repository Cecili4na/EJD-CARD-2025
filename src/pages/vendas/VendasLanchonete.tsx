import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { usePermissions } from '../../hooks/usePermissions'
import { Product, SaleItem } from '../../contexts/DataContext'
import { Button } from '../../components/shared'

const VendasLanchonete: React.FC = () => {
  const { user } = useAuth()
  const { getProducts, getBalance, makeSale } = useData()
  const { canSellLanchonete } = usePermissions()
  
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<SaleItem[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [customerBalance, setCustomerBalance] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Lista de encontristas para seleção (simulada)
  const encontristas = [
    { id: 'encontrista_1', name: 'João Silva', email: 'joao@encontrao.com' },
    { id: 'encontrista_2', name: 'Maria Santos', email: 'maria@encontrao.com' },
    { id: 'encontrista_3', name: 'Pedro Costa', email: 'pedro@encontrao.com' }
  ]

  useEffect(() => {
    if (!canSellLanchonete) {
      setMessage({ type: 'error', text: 'Você não tem permissão para realizar vendas na lanchonete' })
      return
    }
    
    loadProducts()
  }, [canSellLanchonete])

  const loadProducts = () => {
    const lanchoneteProducts = getProducts('lanchonete')
    setProducts(lanchoneteProducts)
  }

  const handleCustomerSelect = (userId: string) => {
    setSelectedUserId(userId)
    const balance = getBalance(userId)
    setCustomerBalance(balance)
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      const newItem: SaleItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price
      }
      setCart([...cart, newItem])
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity }
        : item
    ))
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleFinalizeSale = async () => {
    if (!selectedUserId) {
      setMessage({ type: 'error', text: 'Selecione um cliente primeiro' })
      return
    }
    
    if (cart.length === 0) {
      setMessage({ type: 'error', text: 'Adicione itens ao carrinho' })
      return
    }

    const total = getCartTotal()
    if (customerBalance < total) {
      setMessage({ type: 'error', text: `Saldo insuficiente. Cliente tem R$ ${customerBalance.toFixed(2)}, mas precisa de R$ ${total.toFixed(2)}` })
      return
    }

    setIsProcessing(true)
    setMessage(null)

    try {
      const saleId = makeSale(selectedUserId, user?.id || '', cart, 'lanchonete')
      
      setMessage({ type: 'success', text: `Venda realizada com sucesso! ID: ${saleId}` })
      setCart([])
      setSelectedUserId('')
      setCustomerBalance(0)
      
      // Atualizar saldo do cliente
      const newBalance = getBalance(selectedUserId)
      setCustomerBalance(newBalance)
      
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Erro ao realizar venda' })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!canSellLanchonete) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-200 p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-700 mb-4">Acesso Negado</h2>
        <p className="text-red-600">Você não tem permissão para realizar vendas na lanchonete.</p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8">
      <h2 className="text-2xl font-bold text-black mb-6">🍔 Vendas - Lanchonete</h2>
      
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seleção de Cliente */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">👤 Selecionar Cliente</h3>
          
          <div className="space-y-2">
            {encontristas.map(encontrista => (
              <button
                key={encontrista.id}
                onClick={() => handleCustomerSelect(encontrista.id)}
                className={`w-full p-3 rounded-lg border-2 transition-colors ${
                  selectedUserId === encontrista.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-300 hover:border-emerald-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-medium">{encontrista.name}</div>
                  <div className="text-sm text-gray-600">{encontrista.email}</div>
                </div>
              </button>
            ))}
          </div>

          {selectedUserId && (
            <div className="p-4 bg-emerald-50 rounded-lg">
              <div className="text-sm text-emerald-700">
                <strong>Saldo atual:</strong> R$ {customerBalance.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Produtos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">🍽️ Produtos Disponíveis</h3>
          
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {products.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-black">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.description}</div>
                  <div className="text-lg font-bold text-emerald-600">R$ {product.price.toFixed(2)}</div>
                </div>
                <Button
                  onClick={() => addToCart(product)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2"
                >
                  ➕ Adicionar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carrinho */}
      {cart.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-black mb-4">🛒 Carrinho de Compras</h3>
          
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-black">{item.productName}</div>
                  <div className="text-sm text-gray-600">R$ {item.price.toFixed(2)} cada</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="bg-red-500 hover:bg-red-600 text-black px-2 py-1"
                  >
                    ➖
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="bg-green-500 hover:bg-green-600 text-black px-2 py-1"
                  >
                    ➕
                  </Button>
                  <Button
                    onClick={() => removeFromCart(item.productId)}
                    className="bg-red-500 hover:bg-red-600 text-black px-2 py-1"
                  >
                    🗑️
                  </Button>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-black">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-black">Total:</span>
              <span className="text-2xl font-bold text-emerald-600">
                R$ {getCartTotal().toFixed(2)}
              </span>
            </div>
            
            {selectedUserId && (
              <div className="mt-2 text-sm text-gray-600">
                Saldo após compra: R$ {(customerBalance - getCartTotal()).toFixed(2)}
              </div>
            )}
          </div>

          <div className="mt-4 flex space-x-4">
            <Button
              onClick={handleFinalizeSale}
              disabled={!selectedUserId || isProcessing}
              className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-3 disabled:opacity-50"
            >
              {isProcessing ? '⏳ Processando...' : '✅ Finalizar Venda'}
            </Button>
            
            <Button
              onClick={() => {
                setCart([])
                setMessage(null)
              }}
              className="bg-gray-500 hover:bg-gray-600 text-black px-6 py-3"
            >
              🗑️ Limpar Carrinho
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendasLanchonete

