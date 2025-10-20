import React, { useState } from 'react'
import { Button, Header, ConfirmationModal } from '../../components/shared'
import { useToastContext } from '../../contexts/ToastContext'

interface Card {
  id: string
  name: string
  cardNumber: string
  balance: number
}

interface DebitCardProps {
  onBack: () => void
  cards: Card[]
  onDebit: (cardId: string, amount: number) => void
}

const DebitCard: React.FC<DebitCardProps> = ({ onBack, cards, onDebit }) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [amount, setAmount] = useState('')
  const [formattedAmount, setFormattedAmount] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { showSuccess, showError } = useToastContext()

  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    if (numbers === '') {
      return ''
    }
    
    // Converte para centavos e depois para reais
    const cents = parseInt(numbers)
    const reais = cents / 100
    
    // Formata com vírgula decimal
    return reais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatCurrency(value)
    setFormattedAmount(formatted)
    
    // Remove tudo que não é número e converte para centavos
    const numbers = value.replace(/\D/g, '')
    if (numbers === '') {
      setAmount('0')
    } else {
      const cents = parseInt(numbers)
      setAmount((cents / 100).toString())
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16)
    setCardNumber(value)
    
    // Busca o cartão pelo número digitado
    const foundCard = cards.find(card => card.cardNumber === value)
    setSelectedCard(foundCard || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCard) return

    const debitAmount = parseFloat(amount)
    if (debitAmount > selectedCard.balance) {
      alert('Saldo insuficiente!')
      return
    }

    // Mostrar janela de confirmação
    setShowConfirmation(true)
  }

  const handleConfirmDebit = async () => {
    if (!selectedCard) return

    const debitAmount = parseFloat(amount)
    if (debitAmount > selectedCard.balance) {
      showError(
        'Saldo Insuficiente!',
        'O valor do débito é maior que o saldo disponível no cartão.'
      )
      return
    }

    setIsLoading(true)
    setShowConfirmation(false)
    
    // Simular débito
    setTimeout(() => {
      onDebit(selectedCard.id, debitAmount)
      setIsLoading(false)
      setAmount('')
      setFormattedAmount('')
      setCardNumber('')
      setDescription('')
      setSelectedCard(null)
      
      // Mostrar notificação de sucesso
      showSuccess(
        'Débito Realizado!',
        `R$ ${formattedAmount} foi debitado do cartão ${selectedCard.name} com sucesso.`
      )
    }, 1000)
  }

  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
  }

  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  return (
    <div className="min-h-screen w-full relative" style={{
      background: 'linear-gradient(135deg, #f0fdf4 0%, #fef3c7 25%, #faf5ff 50%, #f0f9ff 75%, #fdf2f8 100%)',
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Bordas decorativas douradas */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-yellow-400 rounded-br-lg z-20"></div>
      <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-yellow-400 rounded-bl-lg z-20"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-8 border-b-4 border-yellow-400 rounded-t-lg z-20"></div>
      
      <div className="w-full px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto w-full">
          {/* Header com botão de voltar */}
          <Header 
            title="💸 Debitar Cartão"
            subtitle="Realize um débito no seu cartão mágico"
            showLogo={false}
            showBackButton={true}
            onBack={onBack}
          />

          {/* Formulário */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Número do Cartão */}
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-semibold text-black mb-2">
                  💳 Número do Cartão
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  required
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                  placeholder="001"
                  maxLength={3}
                />
              </div>

              {/* Valor do débito */}
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-black mb-2">
                  💸 Valor do Débito (R$)
                </label>
                <input
                  type="text"
                  id="amount"
                  value={formattedAmount}
                  onChange={handleAmountChange}
                  required
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                  placeholder="0,00"
                />
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-black mb-2">
                  📝 Descrição (Opcional)
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                  placeholder="Ex: Compra no supermercado"
                />
              </div>

              {/* Informações do cartão selecionado */}
              {selectedCard && (
                <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-xl p-4">
                  <h4 className="font-semibold text-black mb-2">📋 Cartão Selecionado</h4>
                  <p className="text-black"><strong>Nome:</strong> {selectedCard.name}</p>
                  <p className="text-black"><strong>Número:</strong> {formatCardNumber(selectedCard.cardNumber)}</p>
                  <p className="text-black"><strong>Saldo Atual:</strong> R$ {selectedCard.balance.toFixed(2).replace('.', ',')}</p>
                  {amount && (
                    <div className="mt-2">
                      <p className="text-black">
                        <strong>Valor do Débito:</strong> R$ {parseFloat(amount || '0').toFixed(2).replace('.', ',')}
                      </p>
                      <p className={`font-semibold ${parseFloat(amount || '0') > selectedCard.balance ? 'text-red-600' : 'text-black'}`}>
                        <strong>Novo Saldo:</strong> R$ {(selectedCard.balance - parseFloat(amount || '0')).toFixed(2).replace('.', ',')}
                      </p>
                      {parseFloat(amount || '0') > selectedCard.balance && (
                        <p className="text-red-600 text-sm mt-1">
                          ⚠️ Saldo insuficiente!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Botão de Debitar */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 !text-black shadow-lg hover:shadow-red-200 font-semibold"
                disabled={isLoading || !selectedCard || (amount ? parseFloat(amount) > selectedCard.balance : false)}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">✨</span>
                    Processando débito...
                  </>
                ) : (
                  <>
                    💸 Debitar Valor
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCancelConfirmation}
        onConfirm={handleConfirmDebit}
        title="Confirmar Débito"
        icon="💸"
        card={selectedCard}
        transactionType="debit"
        amount={amount}
        formattedAmount={formattedAmount}
        description={description}
        isLoading={isLoading}
      />
    </div>
  )
}

export default DebitCard