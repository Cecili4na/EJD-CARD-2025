/**
 * Hook seguro para vendas - POC
 * 
 * Demonstra como usar o tRPC client no lugar das chamadas diretas ao Supabase
 */

import { trpc } from '../lib/trpc'
import type { ProductCategory } from '../types'

export interface CreateSaleInput {
  cardNumber: string
  category: ProductCategory
  items: {
    productId: string
    quantity: number
  }[]
}

/**
 * Hook para criar vendas de forma segura
 * 
 * Benefícios:
 * - Type-safe end-to-end
 * - Validação automática no backend
 * - Tratamento de erros consistente
 * - Invalidação automática de queries relacionadas
 */
export function useSalesSecure() {
  const utils = trpc.useUtils()

  // Mutation para criar venda
  const createSale = trpc.sales.create.useMutation({
    onSuccess: () => {
      // Invalidar queries relacionadas para forçar refetch
      utils.sales.list.invalidate()
    },
    onError: (error) => {
      console.error('Erro ao criar venda:', error.message)
    },
  })

  // Query para listar vendas
  const useSalesList = (category?: ProductCategory) => {
    return trpc.sales.list.useQuery(
      { category },
      {
        enabled: !!category, // Só busca se categoria estiver definida
      }
    )
  }

  return {
    createSale: {
      mutate: createSale.mutate,
      mutateAsync: createSale.mutateAsync,
      isPending: createSale.isPending,
      isError: createSale.isError,
      error: createSale.error,
      data: createSale.data,
      reset: createSale.reset,
    },
    useSalesList,
  }
}

/**
 * EXEMPLO DE USO:
 * 
 * function SalesPage() {
 *   const { createSale } = useSalesSecure()
 * 
 *   const handleCreateSale = async () => {
 *     try {
 *       const result = await createSale.mutateAsync({
 *         cardNumber: '123',
 *         category: 'lojinha',
 *         items: [
 *           { productId: 'uuid-1', quantity: 2 },
 *           { productId: 'uuid-2', quantity: 1 },
 *         ]
 *       })
 * 
 *       alert(`Venda criada! Novo saldo: R$ ${result.newBalance}`)
 *     } catch (error) {
 *       alert('Erro ao criar venda')
 *     }
 *   }
 * 
 *   return (
 *     <button onClick={handleCreateSale} disabled={createSale.isLoading}>
 *       {createSale.isLoading ? 'Processando...' : 'Criar Venda'}
 *     </button>
 *   )
 * }
 */

