import React, { useState, useEffect } from 'react'
import { Button } from '../components/shared'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useSupabaseData } from '../contexts/SupabaseDataContext'
import { pixService, PixPayment } from '../services/pixService'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface Card {
  id: string
  name: string
  cardNumber: string
  balance: number
  phoneNumber: string
}

interface Purchase {
  id: string
  date: string
  store: string
  product: string
  amount: number
  type: 'lojinha' | 'lanchonete'
}

const MyCardPage: React.FC = () => {
  const { user } = useAuth()
  
  // Usar apenas o contexto apropriado
  let localData: any = null
  let supabaseData: any = null
  
  try {
    if (isSupabaseConfigured()) {
      supabaseData = useSupabaseData()
    } else {
      localData = useData()
    }
  } catch (error) {
    // Fallback para dados locais se Supabase falhar
    localData = useData()
  }
  
  const [card, setCard] = useState<Card | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPixInfo, setShowPixInfo] = useState(false)
  const [pixPayment, setPixPayment] = useState<PixPayment | null>(null)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)

  // Carregar dados do usuário
  useEffect(() => {
    if (!user?.id) return

    loadUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const loadUserData = async () => {
    try {
      if (supabaseData && isSupabaseConfigured()) {
        // Primeiro tentar buscar do contexto (mais rápido)
        let userCard = supabaseData.getCardByUserId(user?.id || '')
        
        // Se não encontrar no contexto, buscar diretamente no Supabase
        if (!userCard) {
          console.log('Cartão não encontrado no contexto, buscando diretamente no Supabase para user:', user?.id)
          const { data: cardData, error } = await supabase
            .from('cards')
            .select('*')
            .eq('user_id', user?.id || '')
            .eq('is_associated', true)
            .maybeSingle()
          
          if (error) {
            console.error('Erro ao buscar cartão:', error)
          }
          
          if (cardData) {
            console.log('Cartão encontrado no Supabase:', cardData)
            // Mapear do formato Supabase para Card
            userCard = {
              id: cardData.id,
              userId: cardData.user_id || '',
              userName: cardData.user_name || '',
              cardNumber: cardData.card_number || '',
              phoneNumber: cardData.phone_number || '',
              balance: parseFloat(cardData.balance) || 0,
              createdAt: cardData.created_at || '',
              updatedAt: cardData.updated_at || ''
            }
          } else {
            console.log('Nenhum cartão associado encontrado para o usuário')
          }
        } else {
          console.log('Cartão encontrado no contexto:', userCard)
        }
        
        if (!userCard) {
          // Sem cartão associado: redirecionar para associação
          console.log('Redirecionando para página de associação...')
          window.location.href = '/cards/associate'
          return
        }

        setCard({
          id: userCard.id,
          name: userCard.userName || 'Sem nome',
          cardNumber: userCard.cardNumber || '',
          balance: userCard.balance || 0,
          phoneNumber: userCard.phoneNumber || ''
        })

        // Carregar histórico de compras
        const sales = supabaseData.getSales()
        
        // Converter vendas em compras do usuário
        const userPurchases: Purchase[] = sales
          .filter((sale: any) => sale.userId === userCard.id)
          .map((sale: any) => ({
            id: sale.id,
            date: sale.createdAt.split('T')[0],
            store: sale.category === 'lojinha' ? 'Lojinha Mágica' : 'Lanchonete do Feiticeiro',
            product: sale.items.map((item: any) => item.productName).join(', '),
            amount: sale.total,
            type: sale.category
          }))

        setPurchases(userPurchases)
      } else {
        // Usar dados locais (modo fallback)
        const userCard: Card = {
          id: '1',
          name: user?.name || 'Meu Cartão',
          cardNumber: '1234567890123456',
          balance: localData.getBalance(user?.id || ''),
          phoneNumber: '11999999999'
        }
        
        setCard(userCard)

        // Simular histórico de compras
        const mockPurchases: Purchase[] = [
          {
            id: '1',
            date: '2025-01-15',
            store: 'Lojinha Mágica',
            product: 'Varinha Mágica',
            amount: 25.50,
            type: 'lojinha'
          },
          {
            id: '2',
            date: '2025-01-14',
            store: 'Lanchonete do Feiticeiro',
            product: 'Hambúrguer Especial',
            amount: 18.00,
            type: 'lanchonete'
          }
        ]
        setPurchases(mockPurchases)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    }
  }

  const handlePixPayment = async () => {
    if (!card || !amount) return

    setIsLoading(true)
    
    try {
      // Gerar PIX usando o serviço
      const payment = await pixService.generatePayment(parseFloat(amount), card.id)
      setPixPayment(payment)
      setShowPixInfo(true)

      // Salvar pagamento no Supabase (se configurado)
      if (supabaseData && isSupabaseConfigured()) {
        await supabase
          .from('pix_payments')
          .insert({
            card_id: card.id,
            amount: parseFloat(amount),
            pix_code: payment.pixCode,
            qr_code_url: payment.qrCodeUrl,
            status: 'pending',
            payment_method: 'mock',
            expires_at: payment.expiresAt.toISOString()
          })
      }

    } catch (error) {
      console.error('Erro ao gerar PIX:', error)
      alert('Erro ao gerar PIX. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!pixPayment || !card) return

    try {
      setIsCheckingPayment(true)

      // Simular confirmação de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (supabaseData && isSupabaseConfigured()) {
        // Atualizar status do pagamento PIX
        await supabase
          .from('pix_payments')
          .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString()
          })
          .eq('pix_code', pixPayment.pixCode)

        // Atualizar saldo diretamente no banco primeiro
        const { data: currentCard, error: fetchError } = await supabase
          .from('cards')
          .select('balance')
          .eq('id', card.id)
          .single()

        if (fetchError) throw fetchError

        const newBalance = (currentCard.balance || 0) + parseFloat(amount)

        // Atualizar saldo no banco
        const { error: updateError } = await supabase
          .from('cards')
          .update({
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', card.id)

        if (updateError) throw updateError

        // Criar transação
        await supabase
          .from('transactions')
          .insert({
            card_id: card.id,
            amount: parseFloat(amount),
            type: 'credit',
            description: 'Abastecimento via PIX',
            created_by: user?.id || 'system'
          })

        // Atualizar estado do cartão imediatamente com o novo saldo
        setCard(prev => prev ? {
          ...prev,
          balance: newBalance
        } : null)

        // Recarregar dados do contexto em background para manter sincronizado
        if (supabaseData?.loadData) {
          supabaseData.loadData().catch(() => {
            // Ignorar erros silenciosamente - o estado já foi atualizado
          })
        }
      } else {
        // Usar dados locais
        localData.addBalance(user?.id || '', parseFloat(amount), 'Abastecimento via PIX')
        
        // Atualizar saldo local
        setCard(prev => prev ? {
          ...prev,
          balance: prev.balance + parseFloat(amount)
        } : null)
      }
      
      setShowPixInfo(false)
      setAmount('')
      setPixPayment(null)
      
      alert('Pagamento confirmado! Saldo atualizado.')
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error)
      alert('Erro ao confirmar pagamento. Tente novamente.')
    } finally {
      setIsCheckingPayment(false)
    }
  }

  const formatCardNumber = (number: string) => {
    if (!number) return ''
    return number.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const copyPixCode = () => {
    if (pixPayment) {
      navigator.clipboard.writeText(pixPayment.pixCode)
      alert('Código PIX copiado!')
    }
  }

  // Mostrar loading se não há dados carregados
  if (!card && !localData && !supabaseData) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando seu cartão...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Aviso sobre Supabase não configurado */}
      {!isSupabaseConfigured() && (
        <div className="bg-blue-100 border border-blue-300 rounded-xl p-4 text-center">
          <p className="text-blue-800 text-sm">
            💡 <strong>Modo Local:</strong> Para usar o banco de dados Supabase, configure as variáveis de ambiente.
            <br />
            <a href="/SUPABASE_SETUP.md" className="underline hover:no-underline">
              Ver guia de configuração
            </a>
          </p>
        </div>
      )}

      {/* Informações do Cartão */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-6 font-cardinal">
            💳 Meu Cartão
          </h2>
          
          {!card ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando informações do cartão...</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nome do Portador */}
            <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-xl p-6">
              <p className="text-black text-sm mb-2">👤 Nome do Portador</p>
              <p className="text-xl font-bold text-black">
                {card?.name || 'Carregando...'}
              </p>
            </div>

            {/* Número do Cartão */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-6">
              <p className="text-black text-sm mb-2">💳 Número do Cartão</p>
              <p className="text-lg font-mono font-bold text-black">
                {formatCardNumber(card?.cardNumber || '')}
              </p>
            </div>

            {/* Saldo Disponível */}
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl p-6">
              <p className="text-black text-sm mb-2">💰 Saldo Disponível</p>
              <p className="text-3xl font-bold text-black">
                R$ {(card?.balance || 0).toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Abastecimento via PIX */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8">
        <h3 className="text-xl font-semibold text-black mb-6 text-center font-cardinal">
          💰 Abastecer via PIX
        </h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-black mb-2">
              💰 Valor a Abastecer (R$)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0,00"
            />
          </div>

          <Button
            onClick={handlePixPayment}
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-200 font-semibold"
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">✨</span>
                Gerando PIX...
              </>
            ) : (
              <>
                💳 Gerar PIX para Abastecimento
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Histórico de Compras */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8">
        <h3 className="text-xl font-semibold text-black mb-6 text-center font-cardinal">
          📋 Histórico de Compras
        </h3>
        
        {purchases.length > 0 ? (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div 
                key={purchase.id}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">
                        {purchase.type === 'lojinha' ? '🏪' : '🍔'}
                      </span>
                      <h4 className="font-semibold text-black">{purchase.product}</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {purchase.store} • {formatDate(purchase.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-black">
                      R$ {purchase.amount.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🛒</div>
            <p className="text-gray-600">Nenhuma compra realizada ainda</p>
          </div>
        )}
      </div>

      {/* Modal de PIX */}
      {showPixInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'none' }}>
          <div 
            className="pix-modal-content text-center"
            style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '2px solid #10b981',
              padding: '1.5rem',
              minHeight: '400px',
              maxWidth: '480px',
              width: '90%'
            }}
          >
              <h3 className="text-2xl font-bold text-black mb-6 font-cardinal">
                📱 PIX Gerado
              </h3>
              
              {/* Código PIX */}
              <div 
                style={{ 
                  border: '2px solid #10b981',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <p className="text-black text-sm font-semibold mb-3">Código PIX</p>
                <div 
                  style={{ 
                    border: '2px solid #34d399',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <p className="text-base font-mono font-bold text-black break-all leading-relaxed">
                    {pixPayment?.pixCode}
                  </p>
                </div>
                <Button
                  onClick={copyPixCode}
                  size="sm"
                  className="w-full !bg-emerald-500 hover:!bg-emerald-600 !text-white !shadow-md !font-bold !opacity-100"
                >
                  📋 Copiar Código
                </Button>
              </div>

              {/* Valor */}
              <div 
                style={{ 
                  border: '2px solid #fbbf24',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <p className="text-black text-sm font-semibold mb-2">Valor a Pagar</p>
                <p className="text-3xl font-bold text-black">
                  R$ {parseFloat(amount).toFixed(2).replace('.', ',')}
                </p>
              </div>

              {/* Botões */}
              <div 
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <Button
                  onClick={handleConfirmPayment}
                  size="lg"
                  className="w-full !bg-gradient-to-r !from-green-500 !to-green-600 hover:!from-green-600 hover:!to-green-700 !text-white !shadow-lg !font-bold !opacity-100"
                  disabled={isCheckingPayment}
                >
                  {isCheckingPayment ? (
                    <>
                      <span className="animate-spin mr-2">✨</span>
                      Confirmando...
                    </>
                  ) : (
                    '✅ Confirmar Pagamento'
                  )}
                </Button>
                
                <Button
                  onClick={() => setShowPixInfo(false)}
                  variant="outline"
                  size="lg"
                  className="w-full !border-2 !border-red-400 !text-red-600 hover:!bg-red-500 hover:!text-white !font-bold !opacity-100"
                >
                  ❌ Cancelar
                </Button>
              </div>

              {/* Instruções */}
              <div 
                style={{ 
                  marginTop: '1.25rem',
                  padding: '1rem',
                  border: '2px solid #93c5fd',
                  borderRadius: '0.5rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <p className="text-sm text-black font-medium">
                  <strong className="text-blue-700">💡 Instruções:</strong><br/>
                  <span className="text-gray-800">
                    1. Copie o código PIX acima<br/>
                    2. Abra seu app bancário<br/>
                    3. Cole o código e faça o pagamento<br/>
                    4. Clique em "Confirmar Pagamento" após pagar
                  </span>
                </p>
              </div>
            </div>
        </div>
      )}
    </div>
  )
}

export default MyCardPage
