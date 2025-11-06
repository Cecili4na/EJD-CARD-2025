import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/historico/lojinha')({
  component: () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-8 text-center">
      <h2 className="text-2xl font-bold text-black mb-4">📊 Histórico Lojinha</h2>
      <p className="text-gray-600">Tela de histórico em desenvolvimento...</p>
    </div>
  ),
})
