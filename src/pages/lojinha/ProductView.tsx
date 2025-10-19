import React from 'react'
import { Button, Card, Header } from '../../components/shared'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
}

interface ProductViewProps {
  product: Product
  onEdit: () => void
  onDelete: () => void
  onBack: () => void
}

const ProductView: React.FC<ProductViewProps> = ({ product, onEdit, onDelete, onBack }) => {
  return (
    <div className="space-y-6">
      {/* Header com botão de voltar */}
      <Header 
        title="👁️ Visualizar Produto"
        subtitle="Detalhes completos do produto"
        showLogo={false}
        showBackButton={true}
        onBack={onBack}
      />

      {/* Card do Produto */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200">
        <div className="space-y-6">
          {/* Cabeçalho com categoria e estoque */}
          <div className="flex justify-between items-start">
            <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-lg font-semibold">
              {product.category}
            </span>
            <span className={`px-4 py-2 rounded-full text-lg font-semibold ${
              product.stock > 10 
                ? 'bg-green-100 text-green-800' 
                : product.stock > 0 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}>
              {product.stock} unidades em estoque
            </span>
          </div>

          {/* Nome do produto */}
          <div>
            <h3 className="text-3xl font-bold text-black font-cardinal mb-2">
              {product.name}
            </h3>
            <div className="w-20 h-1 bg-emerald-500 rounded-full"></div>
          </div>

          {/* Preço */}
          <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-xl p-6">
            <p className="text-emerald-700 text-sm mb-2">Preço de Venda</p>
            <p className="text-4xl font-bold text-black">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* Descrição */}
          <div>
            <h4 className="text-lg font-semibold text-black mb-3">📝 Descrição</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-black leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-semibold text-black mb-2">🆔 ID do Produto</h5>
              <p className="text-black font-mono text-sm">{product.id}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h5 className="font-semibold text-black mb-2">📊 Status do Estoque</h5>
              <p className={`font-semibold ${
                product.stock > 10 
                  ? 'text-green-600' 
                  : product.stock > 0 
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }`}>
                {product.stock > 10 
                  ? '✅ Estoque Alto' 
                  : product.stock > 0 
                    ? '⚠️ Estoque Baixo'
                    : '❌ Sem Estoque'
                }
              </p>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex space-x-4 pt-4">
            <Button
              onClick={onEdit}
              size="lg"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black shadow-lg hover:shadow-emerald-200 font-semibold"
            >
              ✏️ Editar Produto
            </Button>
            <Button
              onClick={onDelete}
              size="lg"
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-black shadow-lg hover:shadow-red-200 font-semibold"
            >
              🗑️ Deletar Produto
            </Button>
          </div>
        </div>
      </Card>

      {/* Informações de valor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-center">
          <p className="text-green-700 text-sm mb-1">Valor Unitário</p>
          <p className="text-2xl font-bold text-black">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-center">
          <p className="text-blue-700 text-sm mb-1">Valor Total em Estoque</p>
          <p className="text-2xl font-bold text-black">
            R$ {(product.price * product.stock).toFixed(2).replace('.', ',')}
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-center">
          <p className="text-purple-700 text-sm mb-1">Unidades Disponíveis</p>
          <p className="text-2xl font-bold text-black">
            {product.stock}
          </p>
        </Card>
      </div>
    </div>
  )
}

export default ProductView