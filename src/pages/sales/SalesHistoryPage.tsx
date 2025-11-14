import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { Header, Card, Button } from '../../components/shared'
import { Sale, useSupabaseData } from '../../contexts/SupabaseDataContext'


type ContextType = 'lojinha' | 'lanchonete'

const SalesHistoryPage: React.FC = () => {
  const { getSales } = useSupabaseData()
  const location = useLocation()
  const navigate = useNavigate()
  const context: ContextType = location.pathname.endsWith('/lojinha') ? 'lojinha' : 'lanchonete'

  const [sales, setSales] = useState<Sale[]>([])
  const [searchName, setSearchName] = useState('')
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadSales()
  }, [context])

  const loadSales = async () => {
    try {
      const fetchedSales = await getSales(context)
      console.log('Vendas carregadas:', fetchedSales)
      setSales(fetchedSales)
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
    }
  }

  const filteredSales = useMemo(() => {
  if (!searchName.trim()) return sales
    return sales.filter(sale =>
      sale.card?.user_name?.toLowerCase().includes(searchName.toLowerCase())
    )
  }, [sales, searchName])


  const title = context === 'lojinha' ? '📊 Histórico de Vendas - Lojinha' : '📊 Histórico de Vendas - Lanchonete'

  const formatDate = (iso: string) => new Date(iso).toLocaleString('pt-BR')
  const formatPrice = (price: number) => price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const isEmpty = useMemo(() => sales.length === 0, [sales])

  const toggleExpanded = (saleId: string) => {
    setExpandedSales(prev => {
      const newSet = new Set(prev)
      if (newSet.has(saleId)) {
        newSet.delete(saleId)
      } else {
        newSet.add(saleId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-6">
      <Header title={title} subtitle="Acompanhe as vendas realizadas" showLogo={false} />

      {isEmpty ? (
        <Card className="bg-white/80 border-yellow-200">
          <div className="p-6 text-center">
            <div className="text-5xl mb-2">🗒️</div>
            <p className="text-gray-600 font-farmhand">Nenhuma venda registrada ainda.</p>
            <div className="mt-4">
              <Button onClick={() => navigate(context === 'lojinha' ? '/lojinha/sales' : '/lanchonete/orders')} className="bg-emerald-500 hover:bg-emerald-600">
                Nova venda
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="px-1">
            <input
              type="text"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              placeholder="Filtrar por nome do cliente..."
              className="w-full px-3 py-2 border rounded-lg font-farmhand text-sm 
                        border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
            />
          </div>
          {filteredSales.map(sale => {
            const isExpanded = expandedSales.has(sale.id)
            return (
              <Card key={sale.id} className="bg-white/80 border-yellow-200">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-bold text-emerald-700 font-cardinal">Venda #{sale.sale_id}</h3>
                        {sale.card.card_number && sale.card.user_name && (
                          <p className="text-sm text-gray-600 font-farmhand">
                            💳 Cartão: {sale.card.card_number} de {sale.card.user_name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mb-2">
                          <p className="text-sm text-gray-600 font-farmhand">
                           Vendedor: {sale.seller.name}
                          </p>
                      </div>
                      <p className="text-sm text-gray-600 font-farmhand">{formatDate(sale.created_at)}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-600 font-farmhand">Total</p>
                      <p className="text-lg font-bold text-sky-900">R$ {formatPrice(sale.total)}</p>
                    </div>
                  </div>

                  {/* Botão para expandir/colapsar itens */}
                  <button
                    onClick={() => toggleExpanded(sale.id)}
                    className="mt-3 w-full flex items-center justify-between p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors duration-200"
                  >
                    <span className="text-sm font-semibold text-emerald-700 font-cardinal">
                      {isExpanded ? '🔽 Esconder itens' : '▶️ Ver itens comprados'}
                    </span>
                    <span className="text-sm text-gray-600 font-farmhand">
                      ({sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'})
                    </span>
                  </button>

                  {/* Dropdown com os itens */}
                  {isExpanded && (
                    <div className="mt-3 border-t pt-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sale.items.map(item => (
                          <div key={item.productId} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-emerald-700 truncate font-cardinal">{item.product_name}</p>
                              <p className="text-xs text-gray-600 font-farmhand">
                                {item.quantity} × R$ {formatPrice(item.price)} = R$ {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SalesHistoryPage


