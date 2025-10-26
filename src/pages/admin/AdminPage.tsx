import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import UserManagement from './UserManagement'

const AdminPage: React.FC = () => {
  const { user } = useAuth()
  const { canManageUsers } = usePermissions()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'management'>('users')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error('Erro ao buscar usuários:', response.statusText)
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8">
      <h2 className="text-2xl font-bold text-black mb-6">👥 Painel Administrativo</h2>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Logado como: <span className="font-semibold">{user?.name || user?.email}</span>
        </p>
        
        {/* Tabs de navegação */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-emerald-500 text-black'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📋 Lista de Usuários
          </button>
          {canManageUsers && (
            <button
              onClick={() => setActiveTab('management')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'management'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⚙️ Gerenciar Usuários
            </button>
          )}
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Nome</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="border border-gray-300 px-4 py-2">{user.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.name || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                      user.role === 'user' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role === 'admin' ? '👑 Admin' : 
                       user.role === 'manager' ? '👨‍💼 Manager' : 
                       user.role === 'user' ? '👤 User' : '👻 Guest'}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(user.createdAt).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <UserManagement />
      )}

      {activeTab === 'users' && (
        <div className="mt-6 text-center">
          <button 
            onClick={fetchUsers}
            className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-lg"
          >
            🔄 Atualizar Lista
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminPage
