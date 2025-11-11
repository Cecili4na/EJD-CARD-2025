import React from 'react'
import { useRouter } from '@tanstack/react-router'
import { usePermissions } from '../../hooks/usePermissions'

interface TabNavigationProps {
  activeTab: 'cards' | 'lojinha' | 'lanchonete' | 'admin' | 'mycard' | 'sapatinho-veloz'
  onTabChange: (tab: 'cards' | 'lojinha' | 'lanchonete' | 'admin' | 'mycard' | 'sapatinho-veloz') => void
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const router = useRouter()
  const { 
    userRole,
    canViewCards,
    canViewAdmin,
    canSellLojinha,
    canSellLanchonete,
    canViewSalesHistoryLojinha,
    canViewSalesHistoryLanchonete,
    canViewOpenOrders
  } = usePermissions()

  return (
    <div className="flex justify-center mb-8 w-full">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-2 shadow-lg border-2 border-yellow-300 w-full max-w-full overflow-x-auto">
        <div className="flex gap-2 justify-center items-center min-w-max px-2 mx-auto">
          {/* Meu Cartão - sempre visível */}
          <button
            onClick={() => onTabChange('mycard')}
            className={`px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
              activeTab === 'mycard'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-900 hover:bg-purple-100 bg-white border-2 border-gray-300'
            }`}
          >
            💳 Meu Cartão
          </button>
          {canViewCards && (
            <button
              onClick={() => onTabChange('cards')}
            className={`px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
              activeTab === 'cards'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-gray-900 hover:bg-emerald-100 bg-white border-2 border-gray-300'
            }`}
            >
              💳 Comunicação
            </button>
          )}
          {userRole !== 'encontrista' && canSellLojinha && (
            <button
              onClick={() => onTabChange('lojinha')}
              className={`px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'lojinha'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-gray-900 hover:bg-emerald-100 bg-white border-2 border-gray-300'
              }`}
            >
              🏪 Lojinha
            </button>
          )}
          {canViewSalesHistoryLojinha && (
            <button
              onClick={() => router.navigate({ to: '/historico/lojinha' })}
              className="px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 text-gray-900 hover:bg-emerald-100 bg-white border-2 border-gray-300 whitespace-nowrap flex-shrink-0"
            >
              📊 Histórico Lojinha
            </button>
          )}
          {userRole !== 'encontrista' && canSellLanchonete && (
            <button
              onClick={() => onTabChange('lanchonete')}
              className={`px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'lanchonete'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-gray-900 hover:bg-emerald-100 bg-white border-2 border-gray-300'
              }`}
            >
              🍔 Lanchonete
            </button>
          )}
          {canViewSalesHistoryLanchonete && (
            <button
              onClick={() => router.navigate({ to: '/historico/lanchonete' })}
              className="px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 text-gray-900 hover:bg-emerald-100 bg-white border-2 border-gray-300 whitespace-nowrap flex-shrink-0"
            >
              📊 Histórico Lanchonete
            </button>
          )}
          {/* Sapatinho Veloz - visível para todos */}
          <button
            onClick={() => router.navigate({ to: '/sapatinho-veloz' })}
            className={`px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
              activeTab === 'sapatinho-veloz'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-gray-900 hover:bg-emerald-100 bg-white border-2 border-gray-300'
            }`}
          >
            👠 Sapatinho Veloz
          </button>
          {canViewOpenOrders && (
            <button
              onClick={() => router.navigate({ to: '/pedidos-lojinha' })}
              className="px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 text-gray-900 hover:bg-emerald-100 bg-white border-2 border-gray-300 whitespace-nowrap flex-shrink-0"
            >
              📦 Pedidos Lojinha
            </button>
          )}
          {canViewOpenOrders && (
            <button
              onClick={() => router.navigate({ to: '/pedidos-sapatinho-veloz' })}
              className="px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 text-gray-900 hover:bg-emerald-100 bg-white border-2 border-gray-300 whitespace-nowrap flex-shrink-0"
            >
              📦 Pedidos Sapatinho Veloz
            </button>
          )}
          {canViewAdmin && (
            <button
              onClick={() => onTabChange('admin')}
            className={`px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
              activeTab === 'admin'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-gray-900 hover:bg-emerald-100 bg-white border-2 border-gray-300'
            }`}
            >
              👥 Admin
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TabNavigation