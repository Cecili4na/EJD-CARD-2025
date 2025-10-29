import React, { useEffect } from 'react'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  duration?: number
  onClose: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return 'ℹ️'
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500 border-emerald-600'
      case 'error':
        return 'bg-red-500 border-red-600'
      case 'warning':
        return 'bg-yellow-500 border-yellow-600'
      case 'info':
        return 'bg-blue-500 border-blue-600'
      default:
        return 'bg-blue-500 border-blue-600'
    }
  }

  return (
    <div className={`toast-notification ${getColors()} text-black rounded-lg shadow-lg border-2 p-4 mb-3 max-w-sm w-full transform transition-all duration-300 ease-in-out`} style={{ zIndex: 10000 }}>
      <div className="flex items-start">
        <div className="flex-shrink-0 text-xl mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm font-cardinal text-black">
            {title}
          </h4>
          <p className="text-sm font-farmhand mt-1 text-black">
            {message}
          </p>
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 ml-2 text-black hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default Toast
