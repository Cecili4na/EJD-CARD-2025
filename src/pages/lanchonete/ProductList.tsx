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

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onCreateNew: () => void
  onBack?: () => void
  title?: string
  subtitle?: string
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onEdit, 
  onDelete, 
  onCreateNew, 
  onBack,
  title = "🛍️ Produtos Cadastrados",
  subtitle = "Gerencie seu catálogo de produtos mágicos"
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Header 
        title={title}
        subtitle={subtitle}
        showLogo={false}
        showBackButton={!!onBack}
        onBack={onBack}
      />

      {/* Botão de criar produto */}
      <div className="flex justify-center">
        <Button
          onClick={onCreateNew}
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg hover:shadow-emerald-200"
        >
          ➕ Novo Produto
        </Button>
      </div>

      {/* Lista de produtos */}
      {products.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-black mb-2">
            Nenhum produto cadastrado
          </h3>
          <p className="text-black mb-6">
            Comece criando seu primeiro produto mágico!
          </p>
          <Button
            onClick={onCreateNew}
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg hover:shadow-emerald-200"
          >
            ➕ Criar Primeiro Produto
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="space-y-4">
                {/* Categoria */}
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                    {product.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    product.stock > 10 
                      ? 'bg-green-100 text-green-800' 
                      : product.stock > 0 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock} em estoque
                  </span>
                </div>

                {/* Nome do produto */}
                <h3 className="text-xl font-bold text-black font-cardinal">
                  {product.name}
                </h3>

                {/* Descrição */}
                <p className="text-black text-sm line-clamp-3">
                  {product.description}
                </p>

                {/* Preço */}
                <div className="text-2xl font-bold text-black">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </div>

                {/* Botões de ação */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onEdit(product)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black"
                  >
                    ✏️ Editar
                  </Button>
                  <Button
                    onClick={() => onDelete(product.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
                  >
                    🗑️ Deletar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Estatísticas */}
      {products.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <h3 className="text-xl font-semibold text-black mb-4 font-cardinal">
            📊 Estatísticas dos Produtos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{products.length}</p>
              <p className="text-black">Total de Produtos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                R$ {products.reduce((sum, product) => sum + product.price, 0).toFixed(2).replace('.', ',')}
              </p>
              <p className="text-black">Valor Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {products.reduce((sum, product) => sum + product.stock, 0)}
              </p>
              <p className="text-black">Total em Estoque</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {products.length > 0 ? (products.reduce((sum, product) => sum + product.price, 0) / products.length).toFixed(2).replace('.', ',') : '0,00'}
              </p>
              <p className="text-black">Preço Médio</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default ProductList