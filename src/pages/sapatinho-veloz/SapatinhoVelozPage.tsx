import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSupabaseData } from '../../contexts/SupabaseDataContext'
import { useProducts } from '../../hooks/useProducts'
import { SaleItem } from '../../types'
import { Button } from '../../components/shared'
import { sapatinhoVelozApi } from '../../api/sapatinho-veloz.api'
import { useToastContext } from '../../contexts/ToastContext'

const TEAMS = [
  'ADM',
  'Lojinha',
  'Vigília',
  'Lanchonete',
  'Banda',
  'Acolhida',
  'Gênios Card',
  'Comunicação',
  'Teatro',
  'Ambientes',
  'Apresentadoras'
]

const SapatinhoVelozPage: React.FC = () => {
  const { user } = useAuth()
  const { getBalance } = useSupabaseData()
  const { data: products = [], isLoading: isLoadingProducts } = useProducts('lojinha')
  const { showSuccess, showError } = useToastContext()

  const [senderName, setSenderName] = useState('')
  const [senderTeam, setSenderTeam] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [message, setMessage] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [userBalance, setUserBalance] = useState<number>(0)

  useEffect(() => {
    if (user?.id) {
      const balance = getBalance(user.id)
      setUserBalance(balance)
    }
  }, [user?.id, getBalance])

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev[productId]) {
        const { [productId]: removed, ...rest } = prev
        return rest
      } else {
        return { ...prev, [productId]: 1 }
      }
    })
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      const { [productId]: removed, ...rest } = selectedProducts
      setSelectedProducts(rest)
    } else {
      setSelectedProducts(prev => ({ ...prev, [productId]: quantity }))
    }
  }

  const getSelectedItems = (): Omit<SaleItem, 'id'>[] => {
    return Object.entries(selectedProducts)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId)
        if (!product) return null
        return {
          productId: product.id,
          productName: product.name,
          quantity,
          price: product.price
        }
      })
      .filter((item): item is Omit<SaleItem, 'id'> => item !== null)
  }

  const getTotal = (): number => {
    return getSelectedItems().reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (!senderTeam) {
      showError('Erro', 'Selecione sua equipe')
      return
    }

    if (!recipientName.trim()) {
      showError('Erro', 'Informe o nome do destinatário')
      return
    }

    if (!recipientAddress) {
      showError('Erro', 'Selecione o endereço/equipe do destinatário')
      return
    }

    // Validação: não pode enviar para si mesmo
    if (senderTeam === recipientAddress && senderName.toLowerCase().trim() === recipientName.toLowerCase().trim()) {
      showError('Erro', 'Você não pode enviar um pedido para si mesmo')
      return
    }

    const items = getSelectedItems()
    if (items.length === 0) {
      showError('Erro', 'Selecione pelo menos um produto')
      return
    }

    const total = getTotal()
    if (userBalance < total) {
      showError('Erro', `Saldo insuficiente. Você tem R$ ${userBalance.toFixed(2)}, mas precisa de R$ ${total.toFixed(2)}`)
      return
    }

    if (!user?.id) {
      showError('Erro', 'Usuário não autenticado')
      return
    }

    setIsProcessing(true)

    try {
      await sapatinhoVelozApi.create({
        senderUserId: user.id,
        senderName: senderName || undefined,
        senderTeam,
        recipientName: recipientName.trim(),
        recipientAddress,
        message: message.trim() || undefined,
        items
      })

      showSuccess('Sucesso!', 'Pedido Sapatinho Veloz criado com sucesso! Sua encomenda chegará ao destinatário até o final do Encontrão.')

      // Limpar formulário
      setSenderName('')
      setSenderTeam('')
      setRecipientName('')
      setRecipientAddress('')
      setMessage('')
      setSelectedProducts({})

      // Atualizar saldo
      const newBalance = getBalance(user.id)
      setUserBalance(newBalance)
    } catch (error: any) {
      showError('Erro', error?.message || 'Erro ao criar pedido')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-yellow-300 p-10">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-black mb-4">👠 Sapatinho Veloz</h2>
        <p className="text-lg text-gray-800 mb-6 leading-relaxed">
          Agradecemos sua participação no nosso Delivery! Sua encomenda chegará ao destinatário até o final do Encontrão.
        </p>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 mb-5 rounded-r-lg">
          <p className="text-base font-bold text-gray-900 mb-3">⚠️ Regras importantes:</p>
          <ul className="text-base text-gray-800 space-y-2 ml-5 list-disc leading-relaxed">
            <li>Só é permitida a venda para o destinatário que não seja você mesmo</li>
            <li>A identificação e a mensagem são opcionais</li>
            <li>Você pode enviar quantos itens quiser</li>
            <li>A encomenda será entregue na Sala de Apoio do destinatário</li>
          </ul>
        </div>
        {userBalance > 0 && (
          <div className="bg-emerald-100 border-2 border-emerald-400 rounded-lg p-4 mb-5">
            <p className="text-lg font-bold text-emerald-900">
              💳 Saldo disponível: R$ {userBalance.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome do Remetente */}
        <div>
          <label htmlFor="senderName" className="block text-base font-semibold text-gray-900 mb-3">
            Seu nome (opcional)
          </label>
          <input
            type="text"
            id="senderName"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full px-5 py-3 text-base border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900"
            placeholder="Seu nome"
          />
        </div>

        {/* Equipe do Remetente */}
        <div>
          <label htmlFor="senderTeam" className="block text-base font-semibold text-gray-900 mb-3">
            Qual a SUA equipe? <span className="text-red-600 font-bold">*</span>
          </label>
          <select
            id="senderTeam"
            value={senderTeam}
            onChange={(e) => setSenderTeam(e.target.value)}
            required
            className="w-full px-5 py-3 text-base border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900"
          >
            <option value="">Selecione sua equipe</option>
            {TEAMS.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        {/* Nome do Destinatário */}
        <div>
          <label htmlFor="recipientName" className="block text-base font-semibold text-gray-900 mb-3">
            Qual nome do destinatário? <span className="text-red-600 font-bold">*</span>
          </label>
          <input
            type="text"
            id="recipientName"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            required
            className="w-full px-5 py-3 text-base border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900"
            placeholder="Nome do destinatário"
          />
        </div>

        {/* Endereço/Equipe do Destinatário */}
        <div>
          <label htmlFor="recipientAddress" className="block text-base font-semibold text-gray-900 mb-3">
            Qual endereço do destinatário? <span className="text-red-600 font-bold">*</span>
          </label>
          <select
            id="recipientAddress"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            required
            className="w-full px-5 py-3 text-base border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900"
          >
            <option value="">Selecione a equipe do destinatário</option>
            {TEAMS.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        {/* Produtos */}
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-3">
            O que você quer enviar? <span className="text-red-600 font-bold">*</span>
          </label>
          {isLoadingProducts ? (
            <p className="text-gray-500">Carregando produtos...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500">Nenhum produto disponível</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto border-2 border-gray-300 rounded-lg p-5 bg-white">
              {products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <input
                      type="checkbox"
                      id={`product-${product.id}`}
                      checked={!!selectedProducts[product.id]}
                      onChange={() => handleProductToggle(product.id)}
                      className="w-6 h-6 text-emerald-600 border-2 border-gray-400 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor={`product-${product.id}`} className="flex-1 cursor-pointer">
                      <div className="text-lg font-bold text-gray-900">{product.name}</div>
                      {product.description && (
                        <div className="text-base text-gray-700 mt-1">{product.description}</div>
                      )}
                      <div className="text-2xl font-bold text-emerald-700 mt-2">R$ {product.price.toFixed(2)}</div>
                    </label>
                  </div>
                  {selectedProducts[product.id] && (
                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, (selectedProducts[product.id] || 1) - 1)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-lg font-bold rounded-lg"
                      >
                        ➖
                      </Button>
                      <span className="w-12 text-center font-bold text-xl text-gray-900">{selectedProducts[product.id]}</span>
                      <Button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, (selectedProducts[product.id] || 1) + 1)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-lg font-bold rounded-lg"
                      >
                        ➕
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mensagem */}
        <div>
          <label htmlFor="message" className="block text-base font-semibold text-gray-900 mb-3">
            Se desejar, escreva uma mensagem especial.
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full px-5 py-3 text-base border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900"
            placeholder="Escreva uma mensagem especial para o destinatário..."
          />
        </div>

        {/* Total */}
        {Object.keys(selectedProducts).length > 0 && (
          <div className="bg-emerald-100 border-2 border-emerald-400 rounded-lg p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xl font-bold text-gray-900">Total:</span>
              <span className="text-3xl font-bold text-emerald-700">
                R$ {getTotal().toFixed(2)}
              </span>
            </div>
            {userBalance > 0 && (
              <div className="text-base text-gray-800 font-medium">
                Saldo após compra: R$ {(userBalance - getTotal()).toFixed(2)}
              </div>
            )}
          </div>
        )}

        {/* Botão de Enviar */}
        <div className="flex space-x-4 mt-8">
          <Button
            type="submit"
            disabled={isProcessing || userBalance < getTotal() || Object.keys(selectedProducts).length === 0}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 text-lg font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isProcessing ? '⏳ Processando...' : '✅ Finalizar Pedido'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default SapatinhoVelozPage

