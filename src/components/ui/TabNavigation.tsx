import React from 'react'

interface TabNavigationProps {
  activeTab: 'cards' | 'lojinha' | 'lanchonete'
  onTabChange: (tab: 'cards' | 'lojinha' | 'lanchonete') => void
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-yellow-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onTabChange('cards')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'cards'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-black hover:bg-emerald-100'
            }`}
          >
            💳 CARTÕES
          </button>
          <button
            onClick={() => onTabChange('lojinha')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'lojinha'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-black hover:bg-emerald-100'
            }`}
          >
            🏪 LOJINHA
          </button>
          <button
            onClick={() => onTabChange('lanchonete')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'lanchonete'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-black hover:bg-emerald-100'
            }`}
          >
            🍔 LANCHONETE
          </button>
        </div>
      </div>
    </div>
  )
}

export default TabNavigation