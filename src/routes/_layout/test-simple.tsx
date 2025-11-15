// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useSalesSimple } from '../../hooks/useSalesSimple'

function TestSimplePage() {
  const [cardNumber, setCardNumber] = useState('777')
  const [selectedCategory, setSelectedCategory] = useState<'lojinha' | 'lanchonete' | 'sapatinho'>('lojinha')
  const [testResult, setTestResult] = useState<string>('')

  const { createSale, useSalesList } = useSalesSimple()
  const { data: salesHistory, refetch } = useSalesList(selectedCategory)

  const handleTestCreateSale = async () => {
    setTestResult('⏳ Criando venda...')
    
    try {
      const result = await createSale.mutateAsync({
        cardNumber,
        category: selectedCategory,
        items: [
          {
            productId: 'c1a2b3c4-d5e6-7890-abcd-ef1234567890', // Substitua por ID real
            quantity: 1,
          },
        ],
      })
      
      setTestResult(`✅ SUCESSO!\n\n${result.message}\n\nSale ID: ${result.saleId}\nTotal: R$ ${result.total.toFixed(2)}\nNovo saldo: R$ ${result.newBalance.toFixed(2)}`)
    } catch (error: any) {
      setTestResult(`❌ ERRO!\n\n${error.message}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-yellow-200 p-8">
        <h1 className="text-3xl font-bold text-center mb-2 font-cardinal">
          ✨ POC SIMPLES - API Express + Zod
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Sem tRPC, sem complicação. Apenas Express + Validação Zod
        </p>

        {/* Loading */}
        {createSale.isPending && (
          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-blue-800 font-semibold">Processando...</p>
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-emerald-200">
          <h2 className="text-xl font-bold mb-4 text-black">🔧 Configuração</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Número do Cartão:
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                placeholder="777"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Categoria:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
              >
                <option value="lojinha">🏪 Lojinha</option>
                <option value="lanchonete">🍔 Lanchonete</option>
                <option value="sapatinho">👠 Sapatinho Veloz</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleTestCreateSale}
            disabled={createSale.isPending || !cardNumber}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg disabled:opacity-50"
          >
            🛒 Criar Venda
          </button>

          <button
            onClick={() => refetch()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg"
          >
            📋 Atualizar Lista
          </button>
        </div>

        {/* Resultado */}
        {testResult && (
          <div className={`rounded-lg p-6 font-mono text-sm whitespace-pre-wrap border-2 ${
            testResult.includes('✅') 
              ? 'bg-green-50 border-green-400 text-green-900' 
              : 'bg-red-50 border-red-400 text-red-900'
          }`}>
            {testResult}
          </div>
        )}

        {/* Histórico */}
        {salesHistory && salesHistory.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-6 border-2 border-gray-300">
            <h3 className="text-lg font-bold mb-4">📊 Vendas ({selectedCategory})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {salesHistory.slice(0, 10).map((sale: any) => (
                <div key={sale.id} className="bg-white rounded-lg p-4 border">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">ID: {sale.id.substring(0, 8)}...</p>
                      <p className="text-sm text-gray-600">
                        {new Date(sale.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <p className="text-lg font-bold">R$ {parseFloat(sale.total).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3 text-yellow-900">✨ Arquitetura SIMPLES</h3>
          <pre className="text-sm text-yellow-900 whitespace-pre-wrap">
{`Frontend (React)
    ↓ fetch()
Express API (:3001)
    ↓ Validação (Zod)
    ↓ Permissões
    ↓ Preços do Banco
Supabase Database

✅ Type-safe
✅ Validado
✅ Seguro
✅ SIMPLES!`}
          </pre>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_layout/test-simple')({
  component: TestSimplePage,
})

