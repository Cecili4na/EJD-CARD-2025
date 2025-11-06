import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesApi } from '../api/sales.api'
import { useToastContext } from '../contexts/ToastContext'

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (category?: 'lojinha' | 'lanchonete') => 
    [...saleKeys.lists(), { category }] as const,
}

export function useSales(category?: 'lojinha' | 'lanchonete') {
  return useQuery({
    queryKey: saleKeys.list(category),
    queryFn: () => salesApi.getAll(category),
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToastContext()

  return useMutation({
    mutationFn: salesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      showSuccess('Sucesso', 'Venda realizada com sucesso')
    },
    onError: (error: any) => {
      showError('Erro', error?.message || 'Erro ao realizar venda')
    },
  })
}


