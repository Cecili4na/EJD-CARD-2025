import { useState } from 'react'
import { Button, Header } from '../../components/shared'

interface Card {
  id: string
  name: string
  cardNumber: string
  balance: number
}

interface CheckBalanceProps {
  onBack: () => void
  cards: Card[]
}

const CheckBalance: React.FC<CheckBalanceProps> = ({ onBack, cards }) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [searchNumber, setSearchNumber] = useState('')

  const handleSearch = () => {
    const card = cards.find(c => c.cardNumber === searchNumber.replace(/\D/g, ''))
    setSelectedCard(card || null)
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
            title="💰 Consultar Saldo"
            subtitle="Verifique o saldo do seu cartão mágico"
            showLogo={false}
            showBackButton={true}
            onBack={onBack}
          />

          {/* Formulário de Busca */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8 mb-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-semibold text-black mb-2">
                  💳 Número do Cartão
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                  placeholder="0000 0000 0000 0000"
                  maxLength={16}
                />
              </div>

              <Button
                onClick={handleSearch}
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black shadow-lg hover:shadow-emerald-200 font-semibold"
              >
                🔍 Consultar Saldo
              </Button>
            </div>
          </div>

          {/* Resultado da Consulta */}
          {selectedCard && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8">
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-black mb-2 font-cardinal">
                    💳 Cartão Encontrado
                  </h3>
                  <p className="text-black font-farmhand">
                    {selectedCard.name}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-xl p-6 mb-6">
                  <p className="text-black text-sm mb-2">Número do Cartão</p>
                  <p className="text-2xl font-mono font-bold text-black">
                    {formatCardNumber(selectedCard.cardNumber)}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl p-6">
                  <p className="text-black text-sm mb-2">Saldo Disponível</p>
                  <p className="text-4xl font-bold text-black">
                    R$ {selectedCard.balance.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de erro */}
          {searchNumber && !selectedCard && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-center">
              <p className="text-black">
                ❌ Cartão não encontrado. Verifique o número digitado.
              </p>
            </div>
          )}

          {/* Lista de cartões disponíveis */}
          {cards.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-black mb-4 text-center font-cardinal">
                📋 Cartões Disponíveis
              </h3>
              <div className="space-y-3">
                {cards.map((card) => (
                  <div 
                    key={card.id}
                    className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-emerald-200 cursor-pointer hover:bg-white/80 transition-colors duration-200"
                    onClick={() => {
                      setSearchNumber(card.cardNumber)
                      setSelectedCard(card)
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-black">{card.name}</p>
                        <p className="text-sm text-black font-mono">
                          {formatCardNumber(card.cardNumber)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-black">
                          R$ {card.balance.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CheckBalance