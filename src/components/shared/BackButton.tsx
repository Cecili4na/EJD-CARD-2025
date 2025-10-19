import React from 'react'
import Button from './Button'

interface BackButtonProps {
  onClick: () => void
  text?: string
  className?: string
}

const BackButton: React.FC<BackButtonProps> = ({ 
  onClick, 
  text = "← Voltar",
  className = ""
}) => {
  return (
    <div className={`flex justify-start mb-4 ${className}`}>
      <Button 
        onClick={onClick}
        variant="outline"
        size="sm"
        className="border-wizard-500 text-wizard-500 hover:bg-wizard-500 hover:text-black"
      >
        {text}
      </Button>
    </div>
  )
}

export default BackButton