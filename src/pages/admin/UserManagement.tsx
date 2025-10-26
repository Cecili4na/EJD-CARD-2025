import React, { useState, useEffect } from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import { Button } from '../../components/shared'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'user' | 'guest'
  createdAt: string
}

const UserManagement: React.FC = () => {
  const { canManageUsers } = usePermissions()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<'admin' | 'manager' | 'user' | 'guest'>('user')

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers()
    }
  }, [canManageUsers])

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: role as any } : user
        ))
        setEditingUser(null)
        alert(`✅ Role alterado para ${role} com sucesso!`)
      } else {
        const error = await response.json()
        alert(`❌ Erro: ${error.error || 'Falha ao alterar role'}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar role:', error)
      alert('❌ Erro de conexão ao alterar role')
    }
  }

  if (!canManageUsers) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-200 p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h2>
        <p className="text-gray-600">Você não tem permissão para gerenciar usuários.</p>
      </div>
    )
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
      <h2 className="text-2xl font-bold text-black mb-6">👥 Gerenciar Usuários</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Nome</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Criado em</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingUser?.id === user.id ? (
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="px-2 py-1 border rounded"
                    >
                      <option value="admin">👑 Admin</option>
                      <option value="manager">👨‍💼 Manager</option>
                      <option value="user">👤 User</option>
                      <option value="guest">👻 Guest</option>
                    </select>
                  ) : (
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
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(user.createdAt).toLocaleString('pt-BR')}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingUser?.id === user.id ? (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => updateUserRole(user.id, newRole)}
                        className="bg-green-500 hover:bg-green-600 text-black"
                      >
                        ✅ Salvar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setEditingUser(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-black"
                      >
                        ❌ Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      {user.role !== 'admin' ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingUser(user)
                            setNewRole(user.role)
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-black"
                        >
                          ✏️ Editar
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          🔒 Protegido
                        </span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center">
        <Button 
          onClick={fetchUsers}
          className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-lg"
        >
          🔄 Atualizar Lista
        </Button>
      </div>
    </div>
  )
}

export default UserManagement
