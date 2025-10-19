import React, { useState } from 'react'
import { Button } from '../shared'

interface LoginProps {
  onLogin?: (credentials: { email: string; password: string }) => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simular delay de login
    setTimeout(() => {
      if (onLogin) {
        onLogin({ email, password })
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #f0fdf4 0%, #fef3c7 25%, #faf5ff 50%, #f0f9ff 75%, #fdf2f8 100%)',
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Bordas decorativas douradas */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-yellow-400 rounded-br-lg z-20"></div>
      <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-yellow-400 rounded-bl-lg z-20"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-8 border-b-4 border-yellow-400 rounded-t-lg z-20"></div>
      
      <div className="w-full max-w-md mx-auto px-4 relative z-10">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <img 
            src="/logo-encontrão-2025.png" 
            alt="Logo Encontrão 2025 - em CAMINHOZ MÁGICOS" 
            className="max-w-xs mx-auto h-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-black mb-2 font-cardinal">
            🧙‍♂️ Bem-vindo ao Mágico de Oz
          </h1>
          <p className="text-black font-farmhand italic">
            Entre na sua jornada mágica
          </p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
                📧 Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                placeholder="seu@email.com"
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
                🔑 Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors duration-200 bg-white/90"
                placeholder="••••••••"
              />
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black shadow-lg hover:shadow-emerald-200 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">✨</span>
                  Entrando na Cidade Esmeralda...
                </>
              ) : (
                <>
                  🏰 Entrar na Cidade Esmeralda
                </>
              )}
            </Button>
          </form>

          {/* Links adicionais */}
          <div className="mt-6 text-center space-y-3">
            <a 
              href="#" 
              className="text-sm text-black hover:text-gray-600 transition-colors duration-200 block"
            >
              🧭 Esqueceu sua senha?
            </a>
            <div className="text-sm text-black">
              Não tem uma conta? 
              <a 
                href="#" 
                className="text-black hover:text-gray-600 font-semibold ml-1 transition-colors duration-200"
              >
                🎭 Crie uma aqui
              </a>
            </div>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="text-center mt-8">
          <div className="flex justify-center space-x-4 text-2xl">
            <span className="animate-bounce">👠</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🛤️</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🏰</span>
            <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>🧙‍♂️</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>✨</span>
          </div>
          <p className="text-black text-sm mt-2 font-farmhand italic">
            "Não há lugar como o lar" - mas este é bem próximo! 🏠
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login