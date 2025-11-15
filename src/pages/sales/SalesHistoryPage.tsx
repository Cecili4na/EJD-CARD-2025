import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { Button } from '../../components/shared'
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


  const title = context === 'lojinha' ? 'Histórico de Vendas' : 'Histórico de Vendas'
  const subtitle = context === 'lojinha' ? 'LOJINHA' : 'LANCHONETE'

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return { date: `${day}.${month}.${year}`, time: `${hours}:${minutes}` }
  }
  
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Textured Background with Noise Grain */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#faf8f5] via-[#f5f1e8] to-[#ebe4d1] -z-10" />
      <div 
        className="fixed inset-0 opacity-[0.015] -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
        {/* Header with Retro-Editorial Style */}
        <div className="mb-12 relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d4704a] to-transparent" />
          
          <div className="space-y-1">
            <div className="inline-block">
              <span 
                className="text-[11px] tracking-[0.3em] font-semibold text-[#9b6b4f] uppercase"
                style={{ fontFamily: "'Courier New', 'Courier', monospace" }}
              >
                {subtitle}
              </span>
              <div className="h-[1px] bg-gradient-to-r from-[#d4704a] to-transparent mt-1" />
            </div>
            
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2d2520] leading-none tracking-tight"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              {title}
            </h1>
            
            <p 
              className="text-sm text-[#8b7355] pt-2 italic"
              style={{ fontFamily: "'Crimson Text', 'Georgia', serif" }}
            >
              Registro completo de transações realizadas
            </p>
          </div>

          {/* Decorative Corner Element */}
          <div className="absolute -right-2 -top-2 w-24 h-24 border-t-2 border-r-2 border-[#d4704a]/20 pointer-events-none" />
        </div>

      {isEmpty ? (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f9f4ed] to-[#f5eee0] rounded-2xl transform rotate-1 transition-transform group-hover:rotate-0" />
          <div className="relative bg-white/90 backdrop-blur-sm border-2 border-dashed border-[#d4704a]/30 rounded-2xl p-12 text-center">
            <div className="text-7xl mb-4 filter grayscale opacity-40">🗒️</div>
            <p 
              className="text-[#6b5744] text-lg mb-6"
              style={{ fontFamily: "'Crimson Text', serif" }}
            >
              Nenhuma venda registrada ainda.
            </p>
            <Button 
              onClick={() => navigate(context === 'lojinha' ? '/lojinha/sales' : '/lanchonete/orders')} 
              className="bg-gradient-to-r from-[#d4704a] to-[#c86a45] hover:from-[#c86a45] hover:to-[#d4704a] text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              + NOVA VENDA
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search Filter */}
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#d4704a]/10 to-transparent rounded-lg transform translate-x-1 translate-y-1 transition-transform group-focus-within:translate-x-0 group-focus-within:translate-y-0" />
            <div className="relative">
              <input
                type="text"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                placeholder="Buscar por cliente..."
                className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-[#d4704a]/20 rounded-lg
                          focus:border-[#d4704a] focus:outline-none focus:ring-0 transition-all
                          placeholder:text-[#b89976] text-[#2d2520] text-base shadow-sm"
                style={{ fontFamily: "'Courier New', monospace" }}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d4704a]/40 text-sm"
                   style={{ fontFamily: "'Courier New', monospace" }}>
                ⌕
              </div>
            </div>
          </div>

          {/* Sales List with Staggered Animation */}
          <div className="space-y-5">
            {filteredSales.map((sale, index) => {
              const isExpanded = expandedSales.has(sale.id)
              const { date, time } = formatDate(sale.created_at)
              
              return (
                <div
                  key={sale.id}
                  className="group relative"
                  style={{
                    animation: 'slideInUp 0.5s ease-out',
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'backwards',
                  }}
                >
                  {/* Receipt-style Card */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#f5eee0] to-[#ebe4d1] rounded-lg transform translate-x-2 translate-y-2 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
                  
                  <div className="relative bg-white/95 backdrop-blur-sm border-l-4 border-[#d4704a] rounded-lg shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl">
                    {/* Dotted Top Border (Receipt Style) */}
                    <div className="absolute top-0 left-0 right-0 h-[2px]"
                         style={{
                           backgroundImage: 'repeating-linear-gradient(to right, #d4704a 0px, #d4704a 8px, transparent 8px, transparent 16px)',
                         }} />
                    
                    <div className="p-5 sm:p-6">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        {/* Left: Sale Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Sale Number */}
                          <div className="flex items-baseline gap-3">
                            <h3 
                              className="text-2xl font-bold text-[#2d2520] tracking-tight"
                              style={{ fontFamily: "'Courier New', monospace" }}
                            >
                              #{sale.sale_id}
                            </h3>
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-[#d4704a]/40 to-transparent self-center" />
                          </div>

                          {/* Card & Customer Info */}
                          {sale.card.card_number && sale.card.user_name && (
                            <div className="flex items-center gap-2 text-[#6b5744]">
                              <span className="text-lg">▪</span>
                              <p 
                                className="text-sm"
                                style={{ fontFamily: "'Crimson Text', serif" }}
                              >
                                Cartão <span className="font-mono font-semibold text-[#d4704a]">{sale.card.card_number}</span>
                                {' • '}
                                <span className="font-semibold">{sale.card.user_name}</span>
                              </p>
                            </div>
                          )}

                          {/* Seller Info */}
                          <div className="flex items-center gap-2 text-[#6b5744]">
                            <span className="text-lg">▪</span>
                            <p 
                              className="text-sm"
                              style={{ fontFamily: "'Crimson Text', serif" }}
                            >
                              Vendedor: <span className="font-semibold">{sale.seller.name}</span>
                            </p>
                          </div>

                          {/* Date & Time */}
                          <div className="flex items-center gap-3 pt-1">
                            <span 
                              className="text-xs tracking-wider text-[#9b6b4f] font-semibold"
                              style={{ fontFamily: "'Courier New', monospace" }}
                            >
                              {date}
                            </span>
                            <span className="text-[#d4704a]/40">•</span>
                            <span 
                              className="text-xs tracking-wider text-[#9b6b4f]"
                              style={{ fontFamily: "'Courier New', monospace" }}
                            >
                              {time}
                            </span>
                          </div>
                        </div>

                        {/* Right: Total Amount */}
                        <div className="text-right">
                          <div className="relative inline-block">
                            <div className="absolute -inset-2 bg-gradient-to-br from-[#d4704a]/5 to-[#c86a45]/10 rounded-lg transform -rotate-2" />
                            <div className="relative px-4 py-3 bg-gradient-to-br from-[#2d2520] to-[#3d3530] rounded-lg shadow-lg">
                              <p 
                                className="text-[10px] tracking-[0.2em] text-[#d4704a] font-semibold mb-1"
                                style={{ fontFamily: "'Courier New', monospace" }}
                              >
                                TOTAL
                              </p>
                              <p 
                                className="text-2xl font-bold text-white tracking-tight tabular-nums"
                                style={{ fontFamily: "'Courier New', monospace" }}
                              >
                                R$ {formatPrice(sale.total)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleExpanded(sale.id)}
                        className="mt-4 w-full group/btn relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#d4704a]/5 to-[#c86a45]/10 transform translate-y-full transition-transform group-hover/btn:translate-y-0" />
                        
                        <div className="relative flex items-center justify-between px-4 py-3 border-2 border-dashed border-[#d4704a]/30 rounded-lg transition-all group-hover/btn:border-[#d4704a]/60">
                          <span 
                            className="text-sm font-semibold text-[#d4704a] tracking-wide"
                            style={{ fontFamily: "'Courier New', monospace" }}
                          >
                            {isExpanded ? '⌄ OCULTAR ITENS' : '› VER ITENS'}
                          </span>
                          <span 
                            className="text-xs text-[#9b6b4f] px-3 py-1 bg-[#faf8f5] rounded-full"
                            style={{ fontFamily: "'Courier New', monospace" }}
                          >
                            {sale.items.length} {sale.items.length === 1 ? 'ITEM' : 'ITENS'}
                          </span>
                        </div>
                      </button>

                      {/* Items List (Expanded) */}
                      {isExpanded && (
                        <div 
                          className="mt-5 pt-5 border-t-2 border-dashed border-[#d4704a]/20"
                          style={{
                            animation: 'fadeIn 0.3s ease-out',
                          }}
                        >
                          <div className="space-y-3">
                            {sale.items.map((item, itemIndex) => (
                              <div
                                key={item.productId}
                                className="group/item relative"
                                style={{
                                  animation: 'slideInRight 0.3s ease-out',
                                  animationDelay: `${itemIndex * 0.05}s`,
                                  animationFillMode: 'backwards',
                                }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f5] to-transparent rounded-lg opacity-0 transition-opacity group-hover/item:opacity-100" />
                                
                                <div className="relative flex items-center justify-between gap-4 p-3 rounded-lg border border-[#ebe4d1] bg-white/50 transition-all group-hover/item:border-[#d4704a]/30">
                                  <div className="flex-1 min-w-0">
                                    <p 
                                      className="font-semibold text-[#2d2520] truncate mb-1"
                                      style={{ fontFamily: "'Crimson Text', serif", fontSize: '15px' }}
                                    >
                                      {item.product_name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span 
                                        className="text-xs text-[#9b6b4f] font-mono tabular-nums"
                                      >
                                        {item.quantity} × R$ {formatPrice(item.price)}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <p 
                                      className="text-base font-bold text-[#d4704a] font-mono tabular-nums"
                                    >
                                      R$ {formatPrice(item.price * item.quantity)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Decorative Corner Tear (Receipt Effect) */}
                    <div className="absolute bottom-0 right-0 w-6 h-6">
                      <div className="absolute inset-0 bg-[#f5eee0]" 
                           style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default SalesHistoryPage


