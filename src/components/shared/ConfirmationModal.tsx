import React from 'react'

interface Card {
  id: string
  name: string
  cardNumber: string
  balance: number
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  description?: string
}

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  icon: string
  card?: Card | null
  transactionType?: 'credit' | 'debit'
  amount?: string
  formattedAmount?: string
  description?: string
  message?: string
  variant?: 'card-transaction' | 'delete-product'
  // Props para exclusão de produto
  product?: Product | null
  // Estado de carregamento
  isLoading?: boolean
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  icon,
  message,
  variant,
  card,
  transactionType,
  amount,
  formattedAmount,
  description,
  product,
  isLoading = false
}) => {
  if (!isOpen) return null

  // Inferir variante quando não informada
  const computedVariant: 'card-transaction' | 'delete-product' | undefined = variant
    ? variant
    : product
      ? 'delete-product'
      : card
        ? 'card-transaction'
        : undefined

  if (computedVariant === 'card-transaction' && !card) return null
  if (computedVariant === 'delete-product' && !product) return null

  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatPrice = (price: number): string => {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const getNewBalance = () => {
    if (!card || !amount) return 0
    const currentBalance = card.balance
    const transactionAmount = parseFloat(amount || '0')
    
    if (transactionType === 'credit') {
      return currentBalance + transactionAmount
    } else {
      return currentBalance - transactionAmount
    }
  }

  const getTransactionLabel = () => {
    return transactionType === 'credit' ? 'Valor a Adicionar' : 'Valor do Débito'
  }

  const getConfirmButtonClass = () => {
    if (computedVariant === 'delete-product') {
      return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
    }
    if (transactionType === 'credit') {
      return 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
    }
    return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
  }

  const getConfirmButtonText = () => {
    if (isLoading) {
      if (computedVariant === 'delete-product') return 'Excluindo...'
      return transactionType === 'credit' ? 'Adicionando...' : 'Processando...'
    }
    return '✅ Confirmar'
  }

  return (
    <div 
      className="modal-overlay fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div 
        data-modal="content"
        className="modal-confirmation rounded-2xl shadow-2xl border-4 border-yellow-200 max-w-md w-full p-8"
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{icon}</div>
          <h3 className="text-2xl font-bold text-black mb-4 font-cardinal">
            {title}
          </h3>
          {message && (
            <p className="text-gray-700 mb-4 font-farmhand">
              {message}
            </p>
          )}
        </div>

        {/* Conteúdo específico por variante */}
        {(computedVariant === 'card-transaction' || (!!card && !computedVariant)) && card && (
          <>
            {/* Dados do Cartão */}
            <div 
              className="rounded-xl p-4 mb-6"
              style={{ 
                background: 'linear-gradient(to right, #d1fae5, #a7f3d0)',
                backgroundColor: '#d1fae5'
              }}
            >
              <h4 className="font-semibold text-black mb-3 font-farmhand">📋 Dados do Cartão</h4>
              <div className="space-y-2">
                <p className="text-black font-farmhand">
                  <strong>Nome:</strong> {card.name}
                </p>
                <p className="text-black font-farmhand">
                  <strong>Número:</strong> {formatCardNumber(card.cardNumber)}
                </p>
                <p className="text-black font-farmhand">
                  <strong>Saldo Atual:</strong> R$ {card.balance.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            {/* Resumo da Transação */}
            <div 
              className="transaction-summary rounded-xl p-4 mb-6"
              style={{ 
                background: 'linear-gradient(to right, #fef3c7, #fde68a)',
                backgroundColor: '#fef3c7'
              }}
            >
              <h4 className="font-semibold text-black mb-3 font-farmhand">💳 Resumo da Transação</h4>
              <div className="space-y-2">
                <p className="text-black font-farmhand">
                  <strong>{getTransactionLabel()}:</strong> R$ {formattedAmount}
                </p>
                {description && (
                  <p className="text-black font-farmhand">
                    <strong>Descrição:</strong> {description}
                  </p>
                )}
                <p className="text-black font-farmhand">
                  <strong>Novo Saldo:</strong> R$ {getNewBalance().toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </>
        )}

        {computedVariant === 'delete-product' && product && (
          <div 
            className="modal-delete-product-info border-2 border-red-200 rounded-lg p-4 mb-6"
            style={{ backgroundColor: '#fef2f2' }}
          >
            <div className="flex items-center space-x-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 font-cardinal">{product.name}</h4>
                <p className="text-sm text-gray-600 font-farmhand">
                  R$ {formatPrice(product.price)}
                </p>
                <p className="text-sm text-gray-600 font-farmhand">
                  Quantidade: {product.quantity}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ❌ Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonClass()}`}
          >
            {isLoading && <span className="animate-spin mr-2">✨</span>}
            {getConfirmButtonText()}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
