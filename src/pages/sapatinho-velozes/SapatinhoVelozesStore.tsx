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

interface Sale {
  id: string
  items: Array<{ product: Product; quantity: number }>
  total: number
  date: Date
}

interface SapatinhoVelozesStoreProps {
  products: Product[]
  onCreateProduct: (product: Omit<Product, 'id'>) => void
  onEditProduct: (productId: string, product: Omit<Product, 'id'>) => void
  onDeleteProduct: (productId: string) => void
  onBack?: () => void
}

type SapatinhoVelozesScreen = 'list' | 'create' | 'edit' | 'view' | 'sales' | 'salesHistory'

const SapatinhoVelozesStore: React.FC<SapatinhoVelozesStoreProps> = ({ 
  products, 
  onCreateProduct, 
  onEditProduct, 
  onDeleteProduct,
  onBack
}) => {
  const [currentScreen, setCurrentScreen] = useState<SapatinhoVelozesScreen>('list')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [sales, setSales] = useState<Sale[]>([])

  const handleCreateProduct = (productData: Omit<Product, 'id'>) => {
    onCreateProduct(productData)
    setCurrentScreen('list')
  }

  const handleEditProduct = (productData: Omit<Product, 'id'>) => {
    if (selectedProduct) {
      onEditProduct(selectedProduct.id, productData)
    }
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
      return <SalesScreen onBack={() => setCurrentScreen('list')} products={products} sales={sales} setSales={setSales} />
    case 'salesHistory':
      return <SalesHistoryScreen onBack={() => setCurrentScreen('list')} sales={sales} />
    default:
      break
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header 
        title="👟 Sapatinho Velozes"
        subtitle="Delivery de calçados e acessórios"
        showLogo={false}
        showBackButton={!!onBack}
        onBack={onBack}
      />

      {/* Botões de ação */}
      <div className="flex justify-center space-x-4 flex-wrap">
        <Button
          onClick={() => setCurrentScreen('sales')}
          size="lg"
          className="bg-ruby-500 hover:bg-ruby-600 text-black shadow-lg hover:shadow-ruby-200"
        >
          🛒 Nova Venda
        </Button>
        <Button
          onClick={() => setCurrentScreen('create')}
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg hover:shadow-emerald-200"
        >
          ➕ Novo Produto
        </Button>
        <Button
          onClick={() => setCurrentScreen('salesHistory')}
          size="lg"
          className="bg-wizard-500 hover:bg-wizard-600 text-black shadow-lg hover:shadow-wizard-200"
        >
          📊 Histórico de Vendas
        </Button>
      </div>

      {/* Lista de produtos */}
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
        title="👟 Catálogo de Produtos"
        subtitle="Gerencie os produtos disponíveis para entrega"
      />
    </div>
  )
}

// Componente de vendas
const SalesScreen: React.FC<{ 
  onBack: () => void
  products: Product[]
  sales: Sale[]
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>
}> = ({ onBack, products, setSales }) => {
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
    if (cart.length === 0) {
      alert('Adicione itens ao carrinho antes de finalizar!')
      return
    }

    setIsProcessing(true)
    // Simular processamento da venda
    setTimeout(() => {
      const newSale: Sale = {
        id: `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        items: [...cart],
        total: getTotal(),
        date: new Date()
      }
      setSales(prevSales => [...prevSales, newSale])
      setCart([])
      setIsProcessing(false)
      alert(`Venda realizada com sucesso! 🎉\nID da Venda: ${newSale.id}`)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de voltar */}
      <Header 
        title="🛒 Nova Venda"
        subtitle="Processe uma nova venda para entrega"
        showLogo={false}
        showBackButton={true}
        onBack={onBack}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Produtos */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200">
          <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
            👟 Produtos Disponíveis
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-black">{product.name}</h4>
                  <p className="text-sm text-black">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                  <p className="text-xs text-gray-600">Estoque: {product.stock}</p>
                </div>
                <Button
                  onClick={() => addToCart(product)}
                  size="sm"
                  className="bg-ruby-500 hover:bg-ruby-600 text-black"
                  disabled={product.stock === 0}
                >
                  ➕ Adicionar
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Carrinho de Compras */}
        <Card className="bg-gradient-to-br from-ruby-50 to-ruby-100 border-ruby-200">
          <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
            🛒 Carrinho de Vendas
          </h3>
          
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🛒</div>
              <p className="text-black">Carrinho vazio</p>
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
                  <span className="text-lg font-semibold text-black">Total:</span>
                  <span className="text-2xl font-bold text-black">
                    R$ {getTotal().toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <Button
                  onClick={processSale}
                  size="lg"
                  className="w-full bg-ruby-500 hover:bg-ruby-600 text-black shadow-lg hover:shadow-ruby-200"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin mr-2">✨</span>
                      Processando...
                    </>
                  ) : (
                    '💳 Finalizar Venda'
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

// Componente de histórico de vendas
const SalesHistoryScreen: React.FC<{ 
  onBack: () => void
  sales: Sale[]
}> = ({ onBack, sales }) => {
  return (
    <div className="space-y-6">
      <Header 
        title="📊 Histórico de Vendas"
        subtitle="Visualize todas as vendas realizadas"
        showLogo={false}
        showBackButton={true}
        onBack={onBack}
      />

      {sales.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-black mb-2">
            Nenhuma venda realizada ainda
          </h3>
          <p className="text-black">
            Comece processando suas primeiras vendas!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <Card key={sale.id} className="bg-gradient-to-br from-ruby-50 to-ruby-100 border-ruby-200">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-black font-cardinal">
                      Venda #{sale.id}
                    </h3>
                    <p className="text-sm text-black">
                      {new Date(sale.date).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-black">
                      R$ {sale.total.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <h4 className="font-semibold text-black mb-2">Itens:</h4>
                  {sale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-black bg-white/50 p-2 rounded">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span>R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-ruby-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-black">Total:</span>
                    <span className="text-xl font-bold text-black">
                      R$ {sale.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Resumo */}
      {sales.length > 0 && (
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
            📈 Resumo Geral
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{sales.length}</p>
              <p className="text-black">Total de Vendas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                R$ {sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2).replace('.', ',')}
              </p>
              <p className="text-black">Valor Total Vendido</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                R$ {sales.length > 0 ? (sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toFixed(2).replace('.', ',') : '0,00'}
              </p>
              <p className="text-black">Ticket Médio</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default SapatinhoVelozesStore

