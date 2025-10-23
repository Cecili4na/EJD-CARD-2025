import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePermissions } from '../../hooks/usePermissions'

interface TabNavigationProps {
  activeTab: 'cards' | 'lojinha' | 'lanchonete' | 'admin' | 'mycard'
  onTabChange: (tab: 'cards' | 'lojinha' | 'lanchonete' | 'admin' | 'mycard') => void
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate()
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
    <div className="flex justify-center mb-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-yellow-200">
        <div className="flex space-x-2">
          {/* Meu Cartão - sempre visível */}
          <button
            onClick={() => onTabChange('mycard')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'mycard'
                ? 'bg-purple-500 text-black shadow-md'
                : 'text-black hover:bg-purple-100'
            }`}
          >
            💳 Meu Cartão
          </button>
          {userRole !== 'encontrista' && (
          <button
            onClick={() => onTabChange('lojinha')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'lojinha'
                ? 'bg-emerald-100 text-black shadow-md'
                : 'text-black hover:bg-emerald-100'
            }`}
          >
            🏪 LOJINHA
          </button>
          )}
          {userRole !== 'encontrista' && (
          <button
            onClick={() => onTabChange('lanchonete')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'lanchonete'
                ? 'bg-emerald-100 text-black shadow-md'
                : 'text-black hover:bg-emerald-100'
            }`}
          >
            🍔 LANCHONETE
          </button>
          )}
          {canViewCards && (
            <button
              onClick={() => onTabChange('cards')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'cards'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-black hover:bg-emerald-100'
              }`}
            >
              💳 Comunicação
            </button>
          )}
          {userRole !== 'encontrista' && canSellLojinha && (
            <button
              onClick={() => onTabChange('lojinha')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'lojinha'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-black hover:bg-emerald-100'
              }`}
            >
              🏪 Lojinha
            </button>
          )}
          {canViewSalesHistoryLojinha && (
            <button
              onClick={() => navigate({ to: '/historico/lojinha' })}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-black hover:bg-emerald-100"
            >
              📊 Histórico Lojinha
            </button>
          )}
          {userRole !== 'encontrista' && canSellLanchonete && (
            <button
              onClick={() => onTabChange('lanchonete')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'lanchonete'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-black hover:bg-emerald-100'
              }`}
            >
              🍔 Lanchonete
            </button>
          )}
          {canViewSalesHistoryLanchonete && (
            <button
              onClick={() => navigate({ to: '/historico/lanchonete' })}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-black hover:bg-emerald-100"
            >
              📊 Histórico Lanchonete
            </button>
          )}
          {canViewOpenOrders && (
            <button
              onClick={() => navigate({ to: '/pedidos-lojinha' })}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-black hover:bg-emerald-100"
            >
              📦 Pedidos Lojinha
            </button>
          )}
          {canViewAdmin && (
            <button
              onClick={() => onTabChange('admin')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-black hover:bg-emerald-100'
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