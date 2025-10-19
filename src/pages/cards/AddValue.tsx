import React, { useState } from 'react'
import { Button, Header } from '../../components/shared'

interface Card {
  id: string
  name: string
  cardNumber: string
  balance: number
}

interface AddValueProps {
  onBack: () => void
  cards: Card[]
  onAddValue: (cardId: string, amount: number) => void
}

const AddValue: React.FC<AddValueProps> = ({ onBack, cards, onAddValue }) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCard) return

    setIsLoading(true)
    
    // Simular adição de valor
    setTimeout(() => {
      onAddValue(selectedCard.id, parseFloat(amount))
      setIsLoading(false)
      setAmount('')
      setSelectedCard(null)
    }, 1000)
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
            title="💰 Inserir Valor"
            subtitle="Adicione valor ao seu cartão mágico"
            showLogo={false}
            showBackButton={true}
            onBack={onBack}
          />

          {/* Formulário */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleção do Cartão */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  💳 Selecionar Cartão
                </label>
                <select
                  value={selectedCard?.id || ''}
                  onChange={(e) => {
                    const card = cards.find(c => c.id === e.target.value)
                    setSelectedCard(card || null)
                  }}
                  required
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                >
                  <option value="">Selecione um cartão</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} - {formatCardNumber(card.cardNumber)} (R$ {card.balance.toFixed(2).replace('.', ',')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Valor a ser adicionado */}
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-black mb-2">
                  💰 Valor a Adicionar (R$)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                  placeholder="0,00"
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
                    <p className="text-black mt-2">
                      <strong>Novo Saldo:</strong> R$ {(selectedCard.balance + parseFloat(amount || '0')).toFixed(2).replace('.', ',')}
                    </p>
                  )}
                </div>
              )}

              {/* Botão de Adicionar */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black shadow-lg hover:shadow-emerald-200 font-semibold"
                disabled={isLoading || !selectedCard}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">✨</span>
                    Adicionando valor...
                  </>
                ) : (
                  <>
                    💰 Adicionar Valor
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Valores pré-definidos */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-black mb-4 text-center font-cardinal">
              💡 Valores Rápidos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[10, 25, 50, 100, 200, 500].map((value) => (
                <Button
                  key={value}
                  onClick={() => setAmount(value.toString())}
                  variant="outline"
                  className="border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                >
                  R$ {value.toFixed(2).replace('.', ',')}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddValue