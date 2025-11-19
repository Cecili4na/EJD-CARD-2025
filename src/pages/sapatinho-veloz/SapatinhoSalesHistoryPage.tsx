import React, { useEffect, useMemo, useState } from 'react'
import { Sale, useSupabaseData } from '../../contexts/SupabaseDataContext'

const SapatinhoSalesHistoryPage: React.FC = () => {
  const { getSales } = useSupabaseData()

  const [sales, setSales] = useState<Sale[]>([])
  const [searchName, setSearchName] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    try {
      setIsLoading(true)
      const fetchedSales = await getSales('sapatinho')
      console.log('Vendas do sapatinho carregadas:', fetchedSales)
      setSales(fetchedSales)
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSales = useMemo(() => {
    if (!searchName.trim()) return sales
    return sales.filter(sale =>
      sale.card?.user_name?.toLowerCase().includes(searchName.toLowerCase())
    )
  }, [sales, searchName])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatPrice = (price: number) => price.toFixed(2)

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-yellow-300 p-10">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-black mb-4">📊 Histórico de Vendas - Sapatinho Mágico</h2>
        <p className="text-lg text-gray-800">Visualize todas as vendas realizadas no Sapatinho Mágico</p>
      </div>

      {/* Search Filter */}
      <div className="mb-6">
        <input
          type="text"
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
          placeholder="Buscar por cliente..."
          className="w-full px-5 py-3 bg-white border-2 border-gray-300 rounded-lg
                    focus:border-yellow-400 focus:outline-none focus:ring-0 transition-all
                    placeholder:text-gray-400 text-gray-900 text-base shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando vendas...</p>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg">Nenhuma venda encontrada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSales.map(sale => (
            <div key={sale.id} className="border-2 border-gray-300 rounded-lg p-6 bg-white shadow-lg">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="flex items-center space-x-4 mb-3">
                    <h3 className="text-2xl font-bold text-black">Venda #{sale.sale_id || sale.id.slice(0, 8)}</h3>
                  </div>
                  <p className="text-base text-gray-700">
                    Criado em: {formatDate(sale.created_at)}
                  </p>
                  {sale.card?.card_number && sale.card?.user_name && (
                    <p className="text-base text-gray-700 mt-1">
                      Cartão: <span className="font-semibold">{sale.card.card_number}</span> • 
                      Cliente: <span className="font-semibold">{sale.card.user_name}</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-700">
                    R$ {formatPrice(sale.total)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className={`rounded-lg p-5 border-2 ${
                  !(sale as any).senderName || (sale as any).senderName === null
                    ? 'bg-purple-50 border-purple-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-black">👤 Remetente</h4>
                    {(!(sale as any).senderName || (sale as any).senderName === null) && (
                      <span className="px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-sm font-bold border-2 border-purple-400">
                        🔒 Anônimo
                      </span>
                    )}
                  </div>
                  {(sale as any).senderName && (sale as any).senderName !== null ? (
                    <>
                      <p className="text-base font-medium text-gray-900">
                        {(sale as any).senderName}
                      </p>
                      {(sale as any).senderTeam && (
                        <p className="text-base text-gray-700 mt-1">
                          Equipe: {(sale as any).senderTeam}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-base font-medium text-purple-900 italic">
                        Remetente anônimo
                      </p>
                      {(sale as any).senderTeam && (
                        <p className="text-base text-purple-700 italic mt-1">
                          Equipe: {(sale as any).senderTeam} (não será exibida)
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-5 border-2 border-gray-200">
                  <h4 className="text-lg font-bold text-black mb-3">📍 Destinatário</h4>
                  {(sale as any).recipientName ? (
                    <>
                      <p className="text-base font-medium text-gray-900">{(sale as any).recipientName}</p>
                      {(sale as any).recipientAddress && (
                        <p className="text-base text-gray-700 mt-1">
                          Entrega na Sala de Apoio da {(sale as any).recipientAddress}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-base text-gray-500 italic">Destinatário não informado</p>
                  )}
                </div>
              </div>

              {(sale as any).message && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-5 mb-5 rounded-r-lg">
                  <h4 className="text-lg font-bold text-black mb-2">💌 Mensagem:</h4>
                  <p className="text-base text-gray-900">{(sale as any).message}</p>
                </div>
              )}

              <div className="mb-5">
                <h4 className="text-lg font-bold text-black mb-3">🛍️ Produtos:</h4>
                <div className="bg-gray-50 rounded-lg p-5 border-2 border-gray-200">
                  <div className="space-y-3">
                    {sale.items?.map((item, index) => (
                      <div key={item.productId || index} className="flex justify-between items-center py-2 border-b border-gray-300 last:border-b-0">
                        <div>
                          <span className="text-base font-semibold text-gray-900">{item.product_name}</span>
                          <span className="text-base text-gray-700 ml-3">x{item.quantity}</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          R$ {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SapatinhoSalesHistoryPage

