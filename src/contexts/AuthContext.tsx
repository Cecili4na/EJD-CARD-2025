import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'genios_card' | 'coord_lojinha' | 'coord_lanchonete' | 'comunicacao' | 'vendedor_lojinha' | 'entregador_lojinha' | 'vendedor_lanchonete' | 'encontrista'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar sessão ao carregar
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch('http://localhost:3000/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        localStorage.removeItem('auth_token')
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error)
      localStorage.removeItem('auth_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro no login')
      }

      const data = await response.json()
      setUser(data.user)
      localStorage.setItem('auth_token', data.session.accessToken)
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      // Definir role baseado no email
      let role = 'encontrista'
      if (email === 'ana.ceci7373@gmail.com') {
        role = 'admin'
      } else if (email.includes('admin')) {
        role = 'admin'
      } else if (email.includes('genios')) {
        role = 'genios_card'
      } else if (email.includes('coord_lojinha')) {
        role = 'coord_lojinha'
      } else if (email.includes('coord_lanchonete')) {
        role = 'coord_lanchonete'
      } else if (email.includes('comunicacao')) {
        role = 'comunicacao'
      } else if (email.includes('vendedor_lojinha')) {
        role = 'vendedor_lojinha'
      } else if (email.includes('entregador')) {
        role = 'entregador_lojinha'
      } else if (email.includes('vendedor_lanchonete')) {
        role = 'vendedor_lanchonete'
      }

      const response = await fetch('http://localhost:3000/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro no registro')
      }

      const data = await response.json()
      setUser(data.user)
      localStorage.setItem('auth_token', data.session.accessToken)
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    }
  }

  const logout = async () => {
    console.log('Logout iniciado...')
    try {
      // Limpar estado local primeiro
      setUser(null)
      localStorage.removeItem('auth_token')
      
      // Tentar notificar o servidor (não crítico se falhar)
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          await fetch('http://localhost:3000/api/auth/sign-out', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        } catch (serverError) {
          console.log('Servidor não disponível para logout, continuando...')
        }
      }
      
      console.log('Logout concluído, redirecionando...')
      // Forçar reload da página para garantir que o estado seja limpo
      window.location.href = '/'
    } catch (error) {
      console.error('Erro no logout:', error)
      // Mesmo com erro, limpar estado local
      setUser(null)
      localStorage.removeItem('auth_token')
      window.location.href = '/'
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
