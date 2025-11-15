/**
 * EXEMPLO DE USO DA POC
 * 
 * Este arquivo demonstra como usar a API segura com tRPC
 */

import React, { useState } from 'react'
import { useSalesSecure } from './src/hooks/useSalesSecure'

export function ExemploVendaSegura() {
  const { createSale, useSalesList } = useSalesSecure()
  
  const [cardNumber, setCardNumber] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<{ id: string; quantity: number }[]>([])

  // Buscar histórico de vendas da lojinha
  const { data: salesHistory, isLoading: loadingHistory } = useSalesList('lojinha')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // ✅ Chamada type-safe ao backend
      // ✅ Validação automática
      // ✅ Permissões verificadas
      // ✅ Preços buscados do banco
      const result = await createSale.mutateAsync({
        cardNumber,
        category: 'lojinha',
        items: selectedProducts.map(p => ({
          productId: p.id,
          quantity: p.quantity,
        })),
      })

      alert(`✅ ${result.message}\nNovo saldo: R$ ${result.newBalance.toFixed(2)}`)
      
      // Limpar formulário
      setCardNumber('')
      setSelectedProducts([])

    } catch (error: any) {
      // Erro já vem formatado do backend
      alert(`❌ Erro: ${error.message}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">POC - Venda Segura com tRPC</h1>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block mb-2">Número do Cartão:</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="border px-4 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={createSale.isLoading || selectedProducts.length === 0}
          className="bg-blue-500 text-white px-6 py-2 rounded disabled:bg-gray-300"
        >
          {createSale.isLoading ? 'Processando...' : 'Criar Venda Segura'}
        </button>

        {createSale.error && (
          <div className="text-red-600 p-4 bg-red-50 rounded">
            Erro: {createSale.error.message}
          </div>
        )}

        {createSale.data && (
          <div className="text-green-600 p-4 bg-green-50 rounded">
            ✅ {createSale.data.message}
          </div>
        )}
      </form>

      {/* Histórico */}
      <div>
        <h2 className="text-xl font-bold mb-2">Histórico de Vendas</h2>
        {loadingHistory && <p>Carregando...</p>}
        {salesHistory && (
          <div className="space-y-2">
            {salesHistory.map((sale: any) => (
              <div key={sale.id} className="border p-4 rounded">
                <p>Total: R$ {parseFloat(sale.total).toFixed(2)}</p>
                <p>Status: {sale.status}</p>
                <p>Data: {new Date(sale.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * COMPARAÇÃO: Antes vs Depois
 * 
 * ❌ ANTES (Inseguro):
 * 
 * const handleSale = async () => {
 *   // Frontend calcula total (pode ser manipulado!)
 *   const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
 *   
 *   // Acesso direto ao banco (sem validação!)
 *   await supabase.from('sales').insert({ total })
 *   await supabase.from('cards').update({ balance: balance - total })
 * }
 * 
 * Problemas:
 * - Preço pode ser manipulado no DevTools
 * - Qualquer um pode criar vendas
 * - Sem verificação de saldo
 * - Race conditions possíveis
 * 
 * 
 * ✅ DEPOIS (Seguro):
 * 
 * const result = await createSale.mutateAsync({
 *   cardNumber: '123',
 *   category: 'lojinha',
 *   items: [{ productId: 'uuid', quantity: 2 }]
 * })
 * 
 * Benefícios:
 * - ✅ Type-safe (autocomplete funcionando)
 * - ✅ Validação automática (Zod)
 * - ✅ Permissões verificadas
 * - ✅ Preços do banco (não confia no frontend)
 * - ✅ Transação atômica SQL
 * - ✅ Logs de auditoria
 * - ✅ Impossível manipular via DevTools
 */

