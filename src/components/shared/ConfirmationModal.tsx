import React from 'react'
import { Button } from './index'

interface Card {
  id: string
  name: string
  cardNumber: string
  balance: number
}

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  icon: string
  card: Card | null
  transactionType: 'credit' | 'debit'
  amount: string
  formattedAmount: string
  description?: string
  isLoading?: boolean
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  icon,
  card,
  transactionType,
  amount,
  formattedAmount,
  description,
  isLoading = false
}) => {
  if (!isOpen || !card) return null

  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const getNewBalance = () => {
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

  return (
    <div className="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="modal-confirmation bg-white rounded-2xl shadow-2xl border border-yellow-200 max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">{icon}</div>
          <h3 className="text-xl font-semibold text-black mb-2 font-cardinal">
            {title}
          </h3>
          <p className="text-gray-600 font-farmhand">
            Verifique os dados antes de confirmar
          </p>
        </div>

        {/* Dados do Cartão */}
        <div className="card-data bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-xl p-4 mb-6">
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
        <div className="transaction-summary bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl p-4 mb-6">
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

        {/* Botões de Ação */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            disabled={isLoading}
          >
            ❌ Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            size="lg"
            className={`flex-1 shadow-lg font-semibold ${
              transactionType === 'credit'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 !text-black hover:shadow-emerald-200'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 !text-black hover:shadow-red-200'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">✨</span>
                {transactionType === 'credit' ? 'Adicionando...' : 'Processando...'}
              </>
            ) : (
              <>
                ✅ Confirmar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
