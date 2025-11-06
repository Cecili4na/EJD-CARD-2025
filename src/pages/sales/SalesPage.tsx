import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Header, Button, Card, ConfirmationModal } from '../../components/shared'
import { productService, Product } from '../../services/productService'
import { salesService, SaleItem } from '../../services/salesService'
import { useToastContext } from '../../contexts/ToastContext'
import { cardService, Card as PaymentCard } from '../../services/cardService'
import { useSupabaseData } from '../../contexts/SupabaseDataContext'

type ContextType = 'lojinha' | 'lanchonete'

const SalesPage: React.FC = () => {
  const { getCardByNumber, makeSale } = useSupabaseData()
  const location = useLocation()
  const navigate = useNavigate()
  const { showSuccess, showError, showWarning } = useToastContext()

  const context: ContextType = location.pathname.startsWith('/lojinha') ? 'lojinha' : 'lanchonete'

  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<Record<string, number>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [selectedCard, setSelectedCard] = useState<any | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 6

  useEffect(() => {
    loadProducts()
    setCartItems({})
    cardService.initializeMockCards()
    setCardNumber('')
    setSelectedCard(null)
    setSearchFilter('')
    setCurrentPage(1)
  }, [context])

  const loadProducts = async () => {
    const loadedProducts = await productService.getProducts(context)
    setProducts(loadedProducts || [])
    setCurrentPage(1)
  }

  // Filtrar produtos por nome
  const filteredProducts = useMemo(() => {
    if (!searchFilter.trim()) return products
    const filterLower = searchFilter.toLowerCase().trim()
    return products.filter(p => p.name.toLowerCase().includes(filterLower))
  }, [products, searchFilter])

  // Produtos paginados
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProducts, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  // Resetar para primeira página quando filtro mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchFilter])

  const total = useMemo(() => {
    return Object.entries(cartItems).reduce((acc, [productId, qty]) => {
      const p = products.find(pr => pr.id === productId)
      if (!p) return acc
      return acc + p.price * qty
    }, 0)
  }, [cartItems, products])

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }))
  }

  const handleDecrease = (productId: string) => {
    setCartItems(prev => {
      const current = prev[productId] || 0
      const next = Math.max(0, current - 1)
      const copy = { ...prev }
      if (next === 0) {
        delete copy[productId]
      } else {
        copy[productId] = next
      }
      return copy
    })
  }

  const handleIncrease = (productId: string) => {
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const handleClearCart = () => setCartItems({})

  const handleCardNumberChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardNumber(value);
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (!value.trim()) {
        setSelectedCard(null);
        return;
      }

      const card = await getCardByNumber(value);
      if (card) {
        setSelectedCard(card);
        setError(null);
      } else {
        setSelectedCard(null);
        setError('Cartão não encontrado');
      }
    } catch (err: any) {
      console.error('Erro ao buscar cartão:', err);
      setError(err?.message || 'Erro ao buscar cartão');
      setSelectedCard(null);
    } finally {
      setIsLoading(false);
    }
  }

  const handleConfirmSale = async () => {
    setError(null)
    setIsLoading(true)
    const items: SaleItem[] = Object.entries(cartItems)
      .filter(([productId]) => productId !== null)
      .map(([productId, quantity]) => {
        const p = products.find(pr => pr.id === productId)!
        return {
          productId: p.id || '',
          productName: p.name,
          price: p.price,
          quantity,
          image: p.image_url
        }
      })

    try {
      await makeSale(
        selectedCard.user_id,
        items,
        context
      )
      
      showSuccess(
        'Venda realizada!',
        `Venda de R$ ${total.toFixed(2)} para cartão ${selectedCard.card_number} de ${selectedCard.user_name} foi realizada com sucesso.`
      )
      
      navigate(`/${context}`)
    } catch (err: any) {
      setError(err?.message || 'Erro ao realizar venda')
      console.error('Erro ao realizar venda:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenConfirmation = () => {
    if (Object.keys(cartItems).length === 0) {
      showWarning('Carrinho vazio', 'Adicione ao menos um item para finalizar a venda.')
      return
    }
    if (!selectedCard) {
      showWarning('Cartão não selecionado', 'Informe um cartão válido para realizar a venda.')
      return
    }
    if (total > selectedCard.balance) {
      showError('Saldo insuficiente', 'O saldo do cartão é insuficiente para concluir a compra.')
      return
    }
    setShowConfirmation(true)
  }

  const handleCancelConfirmation = () => setShowConfirmation(false)

  const formatPrice = (price: number): string => price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const config = context === 'lojinha' ? {
    title: '🛍️ Vendas - Lojinha',
    subtitle: 'Adicione itens ao carrinho e finalize a venda',
    backPath: '/lojinha'
  } : {
    title: '🍔 Vendas - Lanchonete',
    subtitle: 'Adicione itens ao carrinho e finalize o pedido',
    backPath: '/lanchonete'
  }

  return (
    <div className="space-y-6">
      <Header 
        title={config.title}
        subtitle={config.subtitle}
        showLogo={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Produtos */}
        <div className="lg:col-span-2">
          {/* Campo de busca */}
          <div className="mb-4">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="🔍 Buscar produto por nome..."
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90 font-farmhand"
            />
          </div>

          {/* Grid de Produtos */}
          {paginatedProducts.length === 0 ? (
            <Card className="bg-white/80 border-yellow-200">
              <div className="p-6 text-center">
                <p className="text-gray-600 font-farmhand">
                  {searchFilter ? 'Nenhum produto encontrado com esse nome.' : 'Nenhum produto disponível.'}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedProducts.map(p => (
                <Card key={p.id} className="bg-white/80 border-yellow-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="p-3">
                    <div className="h-36 w-full bg-gray-100 rounded-md overflow-hidden flex items-center justify-center mb-3">
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-semibold text-emerald-700 truncate font-cardinal">{p.name}</h4>
                    <p className="text-sm text-sky-900 font-farmhand">R$ {formatPrice(p.price)}</p>
                    <div className="mt-3">
                      <Button onClick={() => handleAddToCart(p)} className="w-full bg-emerald-500 hover:bg-emerald-600 font-cardinal text-sm py-2">
                        ➕ Adicionar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                ← Anterior
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      currentPage === page 
                        ? 'bg-sky-200 hover:bg-sky-300 shadow-lg' 
                        : 'bg-white hover:bg-emerald-100 shadow'
                    }`}
                    style={{ minWidth: '40px' }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-600 text-black"
              >
                Próximo →
              </button>
            </div>
          )}

          {/* Informações de Paginação */}
          {filteredProducts.length > 0 && (
            <div className="text-center text-gray-600 font-farmhand mt-4">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length} produtos
            </div>
          )}
        </div>

        {/* Carrinho */}
        <div>
          <Card className="bg-white/80 border-yellow-200">
            <div className="p-4">
              <h3 className="text-lg font-bold text-emerald-700 mb-3 font-cardinal">🛒 Carrinho</h3>
              {/* Cartão do Cliente dentro do carrinho */}
              <div className="mb-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-semibold text-black mb-2">Número do Cartão</label>
                    <input
                      id="cardNumber"
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                      placeholder="001"
                      maxLength={16}
                    />
                  </div>
                  <div>
                    {selectedCard ? (
                      <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-xl p-3">
                        <p className="text-black"><strong>Nome:</strong> {selectedCard.user_name || 'N/A'}</p>
                        <p className="text-black">
                          <strong>Número:</strong> {
                            selectedCard.card_number 
                              ? selectedCard.card_number.toString().replace(/(\d{4})(?=\d)/g, '$1 ')
                              : 'N/A'
                          }
                        </p>
                        <p className="text-black">
                          <strong>Saldo:</strong> R$ {
                            typeof selectedCard.balance === 'number' 
                              ? selectedCard.balance.toFixed(2).replace('.', ',')
                              : '0,00'
                          }
                        </p>
                        <p className={`text-black mt-1 ${total > (selectedCard.balance || 0) ? 'text-red-600' : ''}`}>
                          <strong>Após compra:</strong> R$ {
                            typeof selectedCard.balance === 'number'
                              ? (selectedCard.balance - total).toFixed(2).replace('.', ',')
                              : '0,00'
                          }
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 font-farmhand">
                        {error || 'Informe um número de cartão válido.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {Object.keys(cartItems).length === 0 ? (
                <p className="text-sm text-gray-600 font-farmhand">Nenhum item no carrinho.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(cartItems).map(([productId, qty]) => {
                    const p = products.find(pr => pr.id === productId)!
                    return (
                      <div key={productId} className="flex items-center gap-2">
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-emerald-700 font-cardinal">{p.name}</p>
                          <p className="text-xs text-sky-900 font-farmhand">R$ {formatPrice(p.price)}</p>
                        </div>
                        <div className="items-center space-x-1 mx-2 flex-shrink-0">
                          <div className="text-sm font-semibold text-sky-900 w-20 text-right flex-shrink-0">
                          <button onClick={() => handleDecrease(productId)} className="px-1.5 py-0.5 mr-1 rounded bg-gray-200 hover:bg-gray-300 text-xs">-</button>
                          <span className="w-5 text-center text-xs">{qty}</span>
                          <button onClick={() => handleIncrease(productId)} className="px-1.5 py-0.5 ml-1 rounded bg-gray-200 hover:bg-gray-300 text-xs">+</button>
                          </div>
                          <div className="text-sm font-semibold text-sky-900 w-20 text-right flex-shrink-0">R$ {formatPrice(p.price * qty)}</div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="font-bold text-emerald-700 font-cardinal">Total</span>
                    <span className="font-bold text-sky-900">R$ {formatPrice(total)}</span>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button onClick={handleClearCart} className="flex-1 bg-ruby-500 hover:bg-ruby-600">Limpar</Button>
                    <Button onClick={handleOpenConfirmation} className="flex-1 bg-emerald-500 hover:bg-emerald-600" disabled={isSaving}>
                      {isSaving ? 'Salvando...' : 'Finalizar'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Confirmação do Pedido */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCancelConfirmation}
        onConfirm={() => { setShowConfirmation(false); handleConfirmSale() }}
        title={context === 'lojinha' ? 'Confirmar Venda' : 'Confirmar Pedido'}
        icon={context === 'lojinha' ? '🛍️' : '🍔'}
        card={selectedCard}
        transactionType="sale" 
        amount={total.toFixed(2)}
        formattedAmount={total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        description={`${Object.entries(cartItems).map(([id, q]) => {
          const p = products.find(pp => pp.id === id)
          return p ? `${p.name} (${q}x)` : ''
        }).filter(Boolean).join(', ')}`}
        isLoading={isSaving}
      />
    </div>
  )
}

export default SalesPage


