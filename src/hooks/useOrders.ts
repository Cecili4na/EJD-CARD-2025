import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api/orders.api'
import { useToastContext } from '../contexts/ToastContext'

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  open: () => [...orderKeys.all, 'open'] as const,
}

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: ordersApi.getAll,
  })
}

export function useOpenOrders() {
  return useQuery({
    queryKey: orderKeys.open(),
    queryFn: ordersApi.getOpenOrders,
  })
}

export function useMarkOrderAsDelivered() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToastContext()

  return useMutation({
    mutationFn: ordersApi.markAsDelivered,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      showSuccess('Sucesso', 'Pedido marcado como entregue')
    },
    onError: (error: any) => {
      showError('Erro', error?.message || 'Erro ao marcar pedido como entregue')
    },
  })
}




