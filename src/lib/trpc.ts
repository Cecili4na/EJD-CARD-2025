/**
 * tRPC Client - Frontend
 * 
 * Cliente type-safe para chamar o backend
 * Integrado com TanStack Query
 */

import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../server/routers/_app'
import { supabase } from './supabase'
import superjson from 'superjson'

/**
 * Cliente tRPC com tipos do backend
 */
export const trpc = createTRPCReact<AppRouter>()

/**
 * Função para obter token de autenticação
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

/**
 * Configuração do cliente tRPC
 */
export function getTrpcClient() {
  // Em desenvolvimento, usar servidor Express local
  // Em produção, usar Vercel Functions
  const url = import.meta.env.DEV 
    ? 'http://localhost:3001/api/trpc'
    : '/api/trpc'

  return trpc.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url,
        
        // Adicionar token de auth em cada requisição
        async headers() {
          const token = await getAuthToken()
          return {
            authorization: token ? `Bearer ${token}` : '',
          }
        },
      }),
    ],
  })
}

