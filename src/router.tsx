import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/query-client'

// Tipos para o contexto do router
export interface RouterContext {
  queryClient: typeof queryClient
  user: any | null
}

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    user: null,
  } as RouterContext,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
