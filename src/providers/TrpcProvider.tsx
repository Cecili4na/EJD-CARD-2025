/**
 * tRPC Provider - Wrapper para a aplicação
 * 
 * Configura o cliente tRPC e integra com TanStack Query existente
 */

import { useState } from 'react'
import { trpc, getTrpcClient } from '../lib/trpc'
import { queryClient } from '../lib/query-client'

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [trpcClient] = useState(() => getTrpcClient())

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  )
}

