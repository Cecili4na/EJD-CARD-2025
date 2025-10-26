import React from 'react'

interface HeaderProps {
  title?: string
  subtitle?: string
  showLogo?: boolean
  showBackButton?: boolean
  onBack?: () => void
  backButtonText?: string
  className?: string
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showLogo = true, 
  showBackButton = false,
  onBack,
  backButtonText = "← Voltar",
  className = ""
}) => {
  return (
    <header className={`text-center mb-12 ${className}`}>
      {/* Botão de voltar */}
      {showBackButton && onBack && (
        <div className="flex justify-start mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 border-2 border-wizard-500 text-wizard-500 hover:bg-wizard-500 hover:text-black rounded-lg font-semibold transition-colors duration-200"
          >
            {backButtonText}
          </button>
        </div>
      )}

      {/* Logo */}
      {showLogo && (
        <div className="mb-8">
          <img 
            src="/logo-encontrão-2025.png" 
            alt="Logo Encontrão 2025 - em CAMINHOZ MÁGICOS" 
            className="max-w-md mx-auto h-auto"
          />
        </div>
      )}

      {/* Título */}
      {title && (
        <h1 className="text-4xl md:text-6xl font-bold text-black mb-4 font-cardinal">
          {title}
        </h1>
      )}

      {/* Subtítulo */}
      {subtitle && (
        <p className="text-xl text-black font-farmhand italic">
          {subtitle}
        </p>
      )}
    </header>
  )
}

export default Header