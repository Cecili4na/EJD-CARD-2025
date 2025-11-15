// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc } from '../../lib/trpc'

function TestPocPage() {
  const [cardNumber, setCardNumber] = useState('777')
  const [selectedCategory, setSelectedCategory] = useState<'lojinha' | 'lanchonete' | 'sapatinho'>('lojinha')
  const [testResult, setTestResult] = useState<string>('')

  // Hook do tRPC para criar venda
  const createSale = trpc.sales.create.useMutation({
    onSuccess: (data) => {
      setTestResult(`✅ SUCESSO!\n\nVenda criada: ${data.saleId}\nTotal: R$ ${data.total.toFixed(2)}\nNovo saldo: R$ ${data.newBalance.toFixed(2)}\n\n${data.message}`)
    },
    onError: (error) => {
      setTestResult(`❌ ERRO!\n\n${error.message}\n\nCódigo: ${error.data?.code || 'UNKNOWN'}`)
    },
  })

  // Query para listar vendas
  const { data: salesHistory, isLoading: loadingHistory, refetch } = trpc.sales.list.useQuery(
    { category: selectedCategory },
    { enabled: false } // Só busca quando clicar
  )

  const handleTestCreateSale = async () => {
    setTestResult('⏳ Testando criação de venda...')
    
    // Simulação: buscar produtos da categoria selecionada
    const mockProducts = {
      lojinha: ['c1a2b3c4-d5e6-7890-abcd-ef1234567890'],
      lanchonete: ['a1b2c3d4-e5f6-7890-1234-567890abcdef'],
      sapatinho: ['f1e2d3c4-b5a6-9087-6543-21fedcba0987'],
    }

    try {
      await createSale.mutateAsync({
        cardNumber,
        category: selectedCategory,
        items: [
          {
            productId: mockProducts[selectedCategory][0],
            quantity: 1,
          },
        ],
      })
    } catch (error) {
      // Erro já tratado no onError
    }
  }

  const handleTestListSales = async () => {
    setTestResult('⏳ Buscando histórico de vendas...')
    try {
      await refetch()
      setTestResult(`✅ Vendas carregadas!\n\nTotal de vendas: ${salesHistory?.length || 0}`)
    } catch (error: any) {
      setTestResult(`❌ Erro ao buscar vendas: ${error.message}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-yellow-200 p-8">
        <h1 className="text-3xl font-bold text-center mb-2 font-cardinal">
          🧪 POC - Backend Seguro com tRPC
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Teste a API segura que valida permissões e busca preços do banco
        </p>

        {/* Status de Loading */}
        {(createSale.isLoading || loadingHistory) && (
          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-blue-800 font-semibold">Processando...</p>
            </div>
          </div>
        )}

        {/* Formulário de Teste */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-emerald-200">
          <h2 className="text-xl font-bold mb-4 text-black">🔧 Configuração do Teste</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Número do Cartão:
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="777"
              />
              <p className="text-xs text-gray-600 mt-1">Use o número do seu cartão ou "777" para teste</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Categoria:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              >
                <option value="lojinha">🏪 Lojinha</option>
                <option value="lanchonete">🍔 Lanchonete</option>
                <option value="sapatinho">👠 Sapatinho Veloz</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botões de Teste */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleTestCreateSale}
            disabled={createSale.isLoading || !cardNumber}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🛒 Testar Criar Venda
          </button>

          <button
            onClick={handleTestListSales}
            disabled={loadingHistory}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📋 Testar Listar Vendas
          </button>
        </div>

        {/* Resultado do Teste */}
        {testResult && (
          <div className={`rounded-lg p-6 font-mono text-sm whitespace-pre-wrap border-2 ${
            testResult.includes('✅') 
              ? 'bg-green-50 border-green-400 text-green-900' 
              : testResult.includes('❌')
              ? 'bg-red-50 border-red-400 text-red-900'
              : 'bg-blue-50 border-blue-400 text-blue-900'
          }`}>
            {testResult}
          </div>
        )}

        {/* Histórico de Vendas */}
        {salesHistory && salesHistory.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-6 border-2 border-gray-300">
            <h3 className="text-lg font-bold mb-4 text-black">📊 Últimas Vendas ({selectedCategory})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {salesHistory.slice(0, 10).map((sale: any) => (
                <div key={sale.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-black">ID: {sale.id.substring(0, 8)}...</p>
                      <p className="text-sm text-gray-600">
                        {new Date(sale.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-black">
                        R$ {parseFloat(sale.total).toFixed(2)}
                      </p>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {sale.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações da POC */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3 text-yellow-900">ℹ️ Sobre esta POC</h3>
          <ul className="space-y-2 text-sm text-yellow-900">
            <li>✅ <strong>Validação de Auth:</strong> Token JWT verificado no backend</li>
            <li>✅ <strong>Verificação de Permissões:</strong> Apenas usuários autorizados podem vender</li>
            <li>✅ <strong>Validação de Dados:</strong> Zod valida automaticamente os inputs</li>
            <li>✅ <strong>Preços do Banco:</strong> Frontend não pode manipular preços</li>
            <li>✅ <strong>Type-Safe:</strong> TypeScript end-to-end (backend → frontend)</li>
            <li>✅ <strong>Transação Atômica:</strong> Venda + Débito + Transação em uma operação</li>
          </ul>
        </div>

        {/* Exemplo de Código */}
        <div className="mt-6 bg-gray-900 rounded-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-3 text-yellow-400">💻 Código usado:</h3>
          <pre className="text-xs overflow-x-auto">
{`const createSale = trpc.sales.create.useMutation()

await createSale.mutateAsync({
  cardNumber: "${cardNumber}",
  category: "${selectedCategory}",
  items: [
    { productId: "uuid-do-produto", quantity: 1 }
  ]
})

// Backend valida:
// ✅ Token JWT
// ✅ Permissões do usuário
// ✅ Dados do request (Zod)
// ✅ Produtos existem
// ✅ Preços do banco
// ✅ Saldo suficiente
// ✅ Transação SQL atômica`}
          </pre>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_layout/test-poc')({
  component: TestPocPage,
})

