/**
 * Vercel Serverless Function - tRPC Handler
 * 
 * Este é o endpoint que a Vercel vai deployar.
 * Rota: /api/trpc/*
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../../src/server/routers/_app'
import { createContext } from '../../src/server/trpc'

/**
 * Handler para requisições tRPC
 * A Vercel automaticamente roteia /api/trpc/* para esta função
 */
export default async function handler(request: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`tRPC Error on ${path}:`, error)
    },
  })
}

/**
 * Configuração da Vercel Edge Runtime (opcional - mais rápido)
 * Pode usar Node.js runtime também, removendo esta linha
 */
export const config = {
  runtime: 'edge',
}

