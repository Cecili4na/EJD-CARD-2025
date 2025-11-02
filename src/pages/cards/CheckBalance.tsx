import { useState } from 'react'
import { Button, Header } from '../../components/shared'
import { useSupabaseData } from '../../contexts/SupabaseDataContext'

interface CheckBalanceProps {
  onBack: () => void
}

const CheckBalance: React.FC<CheckBalanceProps> = ({ onBack }) => {
  const { getCardByNumber } = useSupabaseData()
  const [selectedCard, setSelectedCard] = useState<any | null>(null)
  const [searchNumber, setSearchNumber] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    setError(null)
    setIsLoading(true)
    setHasSearched(true)
    
    try {
      const card = await getCardByNumber(searchNumber.replace(/\s+/g, ''))
      setSelectedCard(card)
      if (!card) {
        setError('Cartão não encontrado')
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao buscar cartão')
      setSelectedCard(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setSearchNumber(value)
    setHasSearched(false)
    setSelectedCard(null)
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
            title="🔍 CONSULTAR SALDO"
            subtitle="Verifique o saldo disponível no seu cartão"
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
                  onChange={(e) => handleInputChange(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                  placeholder="001"
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-center">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <Button
                onClick={handleSearch}
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black shadow-lg hover:shadow-emerald-200 font-semibold"
                disabled={isLoading || !searchNumber}
              >
                {isLoading ? '🔍 Buscando...' : '🔍 CONSULTAR SALDO'}
              </Button>
            </div>
          </div>

          {/* Resultado da Consulta */}
          {selectedCard && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8">
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="font-bold text-black mb-2 font-cardinal">
                    💳 Cartão Encontrado
                  </h3>
                  <p className="text-3xl text-black font-farmhand">
                    {selectedCard.user_name || 'Sem nome'}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-xl p-6 mb-6">
                  <p className="text-black text-sm mb-2">Número do Cartão</p>
                  <p className="text-2xl font-mono font-bold text-black">
                    {formatCardNumber(selectedCard.card_number || '')}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl p-6">
                  <p className="text-black text-sm mb-2">Saldo Disponível</p>
                  <p className="text-4xl font-bold text-black">
                    R$ {(selectedCard.balance || 0).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default CheckBalance