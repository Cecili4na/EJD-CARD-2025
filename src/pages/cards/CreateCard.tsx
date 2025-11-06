import React, { useState } from 'react'
import { Button, Header } from '../../components/shared'
import { useCreateCard } from '../../hooks/useCards'
import { useNavigate } from '@tanstack/react-router'

interface CreateCardProps {
  onBack: () => void
}

const CreateCard: React.FC<CreateCardProps> = ({ onBack }) => {
  const createCardMutation = useCreateCard()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardCode, setCardCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [initialBalance, setInitialBalance] = useState('')
  const [formattedBalance, setFormattedBalance] = useState('')

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

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatCurrency(value)
    setFormattedBalance(formatted)
    
    // Remove tudo que não é número e converte para centavos
    const numbers = value.replace(/\D/g, '')
    if (numbers === '') {
      setInitialBalance('0')
    } else {
      const cents = parseInt(numbers)
      setInitialBalance((cents / 100).toString())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createCardMutation.mutateAsync({
        name,
        cardNumber,
        cardCode,
        phoneNumber,
        initialBalance: parseFloat(initialBalance) || 0
      })
      
      navigate('/cards')
    } catch (error) {
      // Erro já tratado no hook
      console.error('Erro ao criar cartão:', error)
    }
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
            title="💳 CRIAR NOVO CARTÃO"
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
                <label htmlFor="name" className="block text-sm font-semibold text-black mb-2 font-farmhand">
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
                <label htmlFor="cardNumber" className="block text-sm font-semibold text-black mb-2 font-farmhand">
                  💳 Número do Cartão
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  required
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                  placeholder="001"
                  maxLength={3}
                />
              </div>

              {/* Código do Cartão */}
              <div>
                <label htmlFor="cardCode" className="block text-sm font-semibold text-black mb-2 font-farmhand">
                  🔑 Código do Cartão
                </label>
                <input
                  type="text"
                  id="cardCode"
                  value={cardCode}
                  onChange={(e) => setCardCode(e.target.value.replace(/\s+/g, ''))}
                  required
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                  placeholder="Digite o código do cartão"
                />
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-black mb-2 font-farmhand">
                  📱 Telefone
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  required
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                  placeholder="11999999999"
                />
              </div>

              {/* Saldo Inicial */}
              <div>
                <label htmlFor="initialBalance" className="block text-sm font-semibold text-black mb-2 font-farmhand">
                  💰 Saldo Inicial (R$)
                </label>
                <input
                  type="text"
                  id="initialBalance"
                  value={formattedBalance}
                  onChange={handleBalanceChange}
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                  placeholder="0,00"
                />
              </div>

              {/* Mensagem de erro */}
              {createCardMutation.isError && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-center">
                  <p className="text-red-800">
                    {(createCardMutation.error as any)?.message || 'Erro ao criar cartão'}
                  </p>
                </div>
              )}

              {/* Botão de Criar */}
              <Button
                type="submit"
                size="lg"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black shadow-lg hover:shadow-emerald-200 font-semibold"
                disabled={createCardMutation.isPending}
              >
                {createCardMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">✨</span>
                    Criando cartão mágico...
                  </>
                ) : (
                  <>
                    💳 CRIAR CARTÃO
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Informações adicionais */}
          <div className="mt-8 text-center">
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
              <p className="text-black text-sm font-farmhand">
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