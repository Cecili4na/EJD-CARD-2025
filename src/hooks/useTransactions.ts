import { useQuery } from '@tanstack/react-query'
import { transactionsApi } from '../api/transactions.api'

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  byCardId: (cardId: string) => [...transactionKeys.all, 'cardId', cardId] as const,
}

export function useTransactions(cardId?: string) {
  return useQuery({
    queryKey: cardId ? transactionKeys.byCardId(cardId) : transactionKeys.lists(),
    queryFn: () => cardId ? transactionsApi.getByCardId(cardId) : transactionsApi.getAll(),
    enabled: !!cardId || !cardId, // Sempre habilitado
  })
}




