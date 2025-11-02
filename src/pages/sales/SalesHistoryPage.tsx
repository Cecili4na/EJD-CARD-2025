import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Header, Card, Button } from '../../components/shared'
import { salesService, SaleRecord } from '../../services/salesService'

type ContextType = 'lojinha' | 'lanchonete'

const SalesHistoryPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const context: ContextType = location.pathname.startsWith('/lojinha') ? 'lojinha' : 'lanchonete'

  const [sales, setSales] = useState<SaleRecord[]>([])
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSales(salesService.getSales(context))
    setExpandedSales(new Set())
  }, [context])

  const title = context === 'lojinha' ? '🧾 HISTÓRICO DE VENDAS - LOJINHA' : '🧾 HISTÓRICO DE VENDAS - LANCHONETE'

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
          {sales.map(sale => {
            const isExpanded = expandedSales.has(sale.id)
            return (
              <Card key={sale.id} className="bg-white/80 border-yellow-200">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-bold text-emerald-700 font-cardinal">Venda #{sale.id}</h3>
                        {sale.cardNumber && (
                          <p className="text-sm text-gray-600 font-farmhand">
                            💳 Cartão: {sale.cardNumber}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-farmhand">{formatDate(sale.createdAt)}</p>
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
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-emerald-700 truncate font-cardinal">{item.name}</p>
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


