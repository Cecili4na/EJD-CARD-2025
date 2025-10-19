import { useState } from 'react'
import { Button, Card, Header } from '../../components/shared'
import ProductList from './ProductList'
import ProductForm from './ProductForm'
import ProductView from './ProductView'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
}

interface LanchoneteStoreProps {
  products: Product[]
  onCreateProduct: (product: Omit<Product, 'id'>) => void
  onEditProduct: (product: Omit<Product, 'id'>) => void
  onDeleteProduct: (productId: string) => void
  onBack?: () => void
}

type LanchoneteScreen = 'list' | 'create' | 'edit' | 'view' | 'sales'

const LanchoneteStore: React.FC<LanchoneteStoreProps> = ({ 
  products, 
  onCreateProduct, 
  onEditProduct, 
  onDeleteProduct,
  onBack
}) => {
  const [currentScreen, setCurrentScreen] = useState<LanchoneteScreen>('list')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleCreateProduct = (productData: Omit<Product, 'id'>) => {
    onCreateProduct(productData)
    setCurrentScreen('list')
  }

  const handleEditProduct = (productData: Omit<Product, 'id'>) => {
    onEditProduct(productData)
    setCurrentScreen('list')
    setSelectedProduct(null)
  }

  const handleDeleteProduct = (productId: string) => {
    onDeleteProduct(productId)
    setCurrentScreen('list')
    setSelectedProduct(null)
  }

  // Renderizar tela atual
  switch (currentScreen) {
    case 'create':
      return <ProductForm onSave={handleCreateProduct} onCancel={() => setCurrentScreen('list')} />
    case 'edit':
      return <ProductForm product={selectedProduct} onSave={handleEditProduct} onCancel={() => setCurrentScreen('list')} />
    case 'view':
      return selectedProduct ? (
        <ProductView 
          product={selectedProduct} 
          onEdit={() => setCurrentScreen('edit')} 
          onDelete={() => handleDeleteProduct(selectedProduct.id)}
          onBack={() => setCurrentScreen('list')}
        />
      ) : null
    case 'sales':
      return <LanchoneteSales onBack={() => setCurrentScreen('list')} products={products} />
    default:
      break
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header 
        title="🍔 Lanchonete Mágica"
        subtitle="Gerencie produtos e vendas da sua lanchonete"
        showLogo={false}
        showBackButton={!!onBack}
        onBack={onBack}
      />

      {/* Botões de ação */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={() => setCurrentScreen('sales')}
          size="lg"
          className="bg-orange-500 hover:bg-orange-600 text-black shadow-lg hover:shadow-orange-200"
        >
          🍽️ Vendas
        </Button>
        <Button
          onClick={() => setCurrentScreen('create')}
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg hover:shadow-emerald-200"
        >
          ➕ Novo Produto
        </Button>
      </div>

      {/* Lista de produtos da lanchonete */}
      <ProductList 
        products={products}
        onEdit={(product) => {
          setSelectedProduct(product)
          setCurrentScreen('edit')
        }}
        onDelete={(productId) => {
          if (confirm('Tem certeza que deseja deletar este produto?')) {
            handleDeleteProduct(productId)
          }
        }}
        onCreateNew={() => setCurrentScreen('create')}
        title="🍔 Cardápio da Lanchonete"
        subtitle="Gerencie o cardápio da sua lanchonete mágica"
      />
    </div>
  )
}

// Componente de vendas da lanchonete
const LanchoneteSales: React.FC<{ onBack: () => void; products: Product[] }> = ({ onBack, products }) => {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const processSale = async () => {
    setIsProcessing(true)
    // Simular processamento da venda
    setTimeout(() => {
      setCart([])
      setIsProcessing(false)
      alert('Pedido processado com sucesso! 🍔')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de voltar */}
      <Header 
        title="🍽️ Vendas da Lanchonete"
        subtitle="Processe pedidos da lanchonete"
        showLogo={false}
        showBackButton={true}
        onBack={onBack}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Produtos */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200">
          <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
            🍔 Cardápio
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-black">{product.name}</h4>
                  <p className="text-sm text-black">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                  <p className="text-xs text-gray-600">Disponível: {product.stock}</p>
                </div>
                <Button
                  onClick={() => addToCart(product)}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-black"
                  disabled={product.stock === 0}
                >
                  ➕ Pedir
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Carrinho de Pedidos */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
            🍽️ Pedido Atual
          </h3>
          
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🍽️</div>
              <p className="text-black">Nenhum item no pedido</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-black">{item.product.name}</h4>
                    <p className="text-sm text-black">R$ {item.product.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      size="sm"
                      variant="outline"
                      className="border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-black"
                    >
                      ➖
                    </Button>
                    <span className="text-black font-semibold">{item.quantity}</span>
                    <Button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      size="sm"
                      variant="outline"
                      className="border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-black"
                    >
                      ➕
                    </Button>
                    <Button
                      onClick={() => removeFromCart(item.product.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-black">Total do Pedido:</span>
                  <span className="text-2xl font-bold text-black">
                    R$ {getTotal().toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <Button
                  onClick={processSale}
                  size="lg"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-black shadow-lg hover:shadow-orange-200"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin mr-2">✨</span>
                      Processando...
                    </>
                  ) : (
                    '🍔 Finalizar Pedido'
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default LanchoneteStore