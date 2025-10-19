import React, { useState } from 'react'
import { Button, Header } from '../../components/shared'

interface CreateCardProps {
  onBack: () => void
  onCreateCard: (cardData: { name: string; cardNumber: string; initialBalance: number }) => void
}

const CreateCard: React.FC<CreateCardProps> = ({ onBack, onCreateCard }) => {
  const [name, setName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [initialBalance, setInitialBalance] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simular criação do cartão
    setTimeout(() => {
      onCreateCard({
        name,
        cardNumber,
        initialBalance: parseFloat(initialBalance) || 0
      })
      setIsLoading(false)
      onBack()
    }, 1000)
  }

  const generateCardNumber = () => {
    const number = Math.floor(Math.random() * 9000000000000000) + 1000000000000000
    setCardNumber(number.toString())
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
            title="🏦 Criar Novo Cartão"
            subtitle="Emita um novo cartão de débito mágico"
            showLogo={false}
            showBackButton={true}
            onBack={onBack}
          />

          {/* Formulário */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome do Portador */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-black mb-2">
                  👤 Nome do Portador
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                  placeholder="Digite o nome completo"
                />
              </div>

              {/* Número do Cartão */}
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-semibold text-black mb-2">
                  💳 Número do Cartão
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    required
                    className="flex-1 px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                    placeholder="0000 0000 0000 0000"
                    maxLength={16}
                  />
                  <Button
                    type="button"
                    onClick={generateCardNumber}
                    variant="outline"
                    className="border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                  >
                    🎲 Gerar
                  </Button>
                </div>
              </div>

              {/* Saldo Inicial */}
              <div>
                <label htmlFor="initialBalance" className="block text-sm font-semibold text-black mb-2">
                  💰 Saldo Inicial (R$)
                </label>
                <input
                  type="number"
                  id="initialBalance"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                  placeholder="0,00"
                />
              </div>

              {/* Botão de Criar */}
              <Button
                type="submit"
                size="lg"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black shadow-lg hover:shadow-emerald-200 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">✨</span>
                    Criando cartão mágico...
                  </>
                ) : (
                  <>
                    🏦 Criar Cartão
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Informações adicionais */}
          <div className="mt-8 text-center">
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
              <p className="text-black text-sm">
                💡 <strong>Dica:</strong> O cartão será criado com as informações fornecidas e estará disponível imediatamente para uso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateCard