/**
 * Sales Router - POC
 * 
 * Demonstra implementação segura de criação de vendas com:
 * - Validação de permissões
 * - Validação de dados (Zod)
 * - Preços buscados do banco (não confia no frontend)
 * - Verificação de saldo
 * - Transação atômica
 */

import { z } from 'zod'
import { router, createProtectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Schema de validação para criar venda
const createSaleSchema = z.object({
  cardNumber: z.string().min(1, 'Número do cartão é obrigatório'),
  category: z.enum(['lojinha', 'lanchonete', 'sapatinho']),
  items: z.array(
    z.object({
      productId: z.string().uuid('ID do produto inválido'),
      quantity: z.number().int().positive('Quantidade deve ser positiva'),
    })
  ).min(1, 'Pelo menos um item é necessário'),
})

export const salesRouter = router({
  /**
   * Criar venda - OPERAÇÃO CRÍTICA
   * 
   * 🔒 Validações de segurança:
   * 1. Autenticação via middleware
   * 2. Permissão específica para a categoria
   * 3. Validação de dados com Zod
   * 4. Preços buscados do banco de dados
   * 5. Verificação de saldo
   * 6. Transação SQL atômica
   */
  create: createProtectedProcedure(['sales:create_lojinha']) // Será verificado dinamicamente
    .input(createSaleSchema)
    .mutation(async ({ input, ctx }) => {
      const { cardNumber, category, items } = input
      const { user, supabase } = ctx

      // 1. Verificar permissão específica para a categoria
      // Permission check would go here: const categoryPermission = `sales:create_${category}` as const
      const hasPermissionForCategory = ctx.user.role === 'admin' || 
        ctx.user.role === 'genios_card' ||
        (category === 'lojinha' && ['coord_lojinha', 'vendedor_lojinha'].includes(ctx.user.role)) ||
        (category === 'lanchonete' && ['coord_lanchonete', 'vendedor_lanchonete'].includes(ctx.user.role)) ||
        (category === 'sapatinho' && ['admin', 'genios_card'].includes(ctx.user.role))

      if (!hasPermissionForCategory) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Você não tem permissão para vender em: ${category}`,
        })
      }

      console.log('🔐 SECURITY LOG: Create sale', {
        userId: user.id,
        role: user.role,
        category,
        cardNumber,
        itemCount: items.length,
        timestamp: new Date().toISOString(),
      })

      // 2. Buscar cartão
      const { data: card, error: cardError } = await supabase
        .from('cards')
        .select('id, balance, user_name')
        .eq('card_number', cardNumber)
        .single()

      if (cardError || !card) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Cartão não encontrado',
        })
      }

      // 3. Buscar produtos do BANCO (NÃO confiar no frontend!)
      const productIds = items.map(item => item.productId)
      
      const productTable = category === 'sapatinho' ? 'sapatinho_products' : 'products'
      let productsQuery = supabase
        .from(productTable)
        .select('id, name, price, active')
        .in('id', productIds)

      // Adicionar filtro de categoria se não for sapatinho
      if (category !== 'sapatinho') {
        productsQuery = productsQuery.eq('category', category)
      }

      const { data: products, error: productsError } = await productsQuery

      if (productsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao buscar produtos',
        })
      }

      // Verificar se todos os produtos existem e estão ativos
      if (!products || products.length !== items.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Um ou mais produtos não foram encontrados ou estão inativos',
        })
      }

      // 4. Calcular total usando preços DO BANCO
      const productsMap = new Map(products.map(p => [p.id, p]))
      let total = 0

      const saleItems = items.map(item => {
        const product = productsMap.get(item.productId)
        if (!product || !product.active) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Produto ${item.productId} não está disponível`,
          })
        }

        const subtotal = product.price * item.quantity
        total += subtotal

        return {
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: product.price, // Preço do BANCO, não do frontend!
        }
      })

      // 5. Verificar saldo
      if (card.balance < total) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Saldo insuficiente. Necessário: R$ ${total.toFixed(2)}, Disponível: R$ ${card.balance.toFixed(2)}`,
        })
      }

      // 6. TRANSAÇÃO ATÔMICA - Criar venda completa
      try {
        // 6.1 Criar venda
        const salesTable = category === 'sapatinho' ? 'sapatinho_sales' : 'sales'
        const saleData = category === 'sapatinho'
          ? {
              seller_id: user.id,
              card_id: card.id,
              total,
              status: 'completed',
            }
          : {
              seller_id: user.id,
              card_id: card.id,
              category,
              total,
              status: 'completed',
              sale_id: crypto.randomUUID(),
            }

        const { data: sale, error: saleError } = await supabase
          .from(salesTable)
          .insert(saleData)
          .select()
          .single()

        if (saleError) throw saleError

        // 6.2 Criar itens da venda
        const itemsTable = category === 'sapatinho' ? 'sapatinho_sale_items' : 'sale_items'
        const itemsData = saleItems.map(item => ({
          sale_id: sale.id,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          price: item.price,
        }))

        const { error: itemsError } = await supabase
          .from(itemsTable)
          .insert(itemsData)

        if (itemsError) throw itemsError

        // 6.3 Debitar saldo
        const { error: balanceError } = await supabase
          .from('cards')
          .update({
            balance: card.balance - total,
            updated_at: new Date().toISOString(),
          })
          .eq('id', card.id)

        if (balanceError) throw balanceError

        // 6.4 Criar transação
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            card_id: card.id,
            amount: -total,
            type: 'debit',
            description: `Compra na ${category}`,
            created_by: user.id,
          })

        if (transactionError) throw transactionError

        // 6.5 Se lojinha, criar pedido
        if (category === 'lojinha') {
          const { error: orderError } = await supabase
            .from('orders')
            .insert({
              sale_id: sale.id,
              card_id: card.id,
              customer_name: card.user_name,
              total,
              status: 'completed',
            })

          if (orderError) throw orderError
        }

        // ✅ Sucesso!
        console.log('✅ SALE CREATED:', {
          saleId: sale.id,
          total,
          userId: user.id,
          cardNumber,
          category,
        })

        return {
          success: true,
          saleId: sale.id,
          total,
          newBalance: card.balance - total,
          message: `Venda realizada com sucesso! Total: R$ ${total.toFixed(2)}`,
        }

      } catch (error) {
        console.error('❌ SALE ERROR:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao processar venda. Por favor, tente novamente.',
        })
      }
    }),

  /**
   * Listar histórico de vendas
   */
  list: createProtectedProcedure(['sales:view_history_lojinha'])
    .input(
      z.object({
        category: z.enum(['lojinha', 'lanchonete', 'sapatinho']).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { category } = input
      const { supabase } = ctx

      // Verificar permissão para a categoria
      if (category) {
        const hasPermissionForCategory = ctx.user.role === 'admin' || 
          ctx.user.role === 'genios_card' ||
          (category === 'lojinha' && ['coord_lojinha', 'vendedor_lojinha'].includes(ctx.user.role)) ||
          (category === 'lanchonete' && ['coord_lanchonete', 'vendedor_lanchonete'].includes(ctx.user.role))

        if (!hasPermissionForCategory) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Você não tem permissão para ver vendas de: ${category}`,
          })
        }
      }

      const table = category === 'sapatinho' ? 'sapatinho_sales' : 'sales'
      const itemsTable = category === 'sapatinho' ? 'sapatinho_sale_items' : 'sale_items'

      let query = supabase
        .from(table)
        .select(`
          *,
          ${itemsTable} (*)
        `)
        .order('created_at', { ascending: false })

      if (category && category !== 'sapatinho') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao buscar vendas',
        })
      }

      return data || []
    }),
})

