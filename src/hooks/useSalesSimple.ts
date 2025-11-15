/**
 * Hook SIMPLES para vendas
 * Usa React Query + API fetch
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { salesApi, type CreateSaleInput } from '../lib/api-client'

export function useSalesSimple() {
  const queryClient = useQueryClient()

  // Mutation para criar venda
  const createSale = useMutation({
    mutationFn: (data: CreateSaleInput) => salesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
    },
  })

  // Query para listar vendas
  const useSalesList = (category?: string) => {
    return useQuery({
      queryKey: ['sales', category],
      queryFn: () => salesApi.list(category),
      enabled: !!category,
    })
  }

  return {
    createSale,
    useSalesList,
  }
}

