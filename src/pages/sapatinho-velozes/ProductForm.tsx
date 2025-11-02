import React, { useState, useEffect } from 'react'
import { Button, Header } from '../../components/shared'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
}

interface ProductFormProps {
  product?: Product | null
  onSave: (product: Omit<Product, 'id'>) => void
  onCancel: () => void
  isLoading?: boolean
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Produto',
    stock: ''
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString()
      })
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock)
    }

    onSave(productData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header 
        title={product ? '✏️ Editar Produto' : '➕ Novo Produto'}
        subtitle={product ? 'Atualize as informações do produto' : 'Cadastre um novo produto para delivery'}
        showLogo={false}
        showBackButton={true}
        onBack={onCancel}
      />

      {/* Formulário */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-ruby-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome do Produto */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-black mb-2">
              👟 Nome do Produto
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-ruby-200 rounded-lg focus:border-ruby-500 focus:ring-2 focus:ring-ruby-200 transition-colors duration-200 bg-white/90 text-black"
              placeholder="Digite o nome do produto"
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-black mb-2">
              📝 Descrição
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 border-2 border-ruby-200 rounded-lg focus:border-ruby-500 focus:ring-2 focus:ring-ruby-200 transition-colors duration-200 bg-white/90 resize-none text-black"
              placeholder="Descreva o produto detalhadamente"
            />
          </div>

          {/* Preço e Estoque */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-black mb-2">
                💰 Preço (R$)
              </label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 border-2 border-ruby-200 rounded-lg focus:border-ruby-500 focus:ring-2 focus:ring-ruby-200 transition-colors duration-200 bg-white/90 text-black"
                placeholder="0,00"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-semibold text-black mb-2">
                📦 Estoque
              </label>
              <input
                type="number"
                id="stock"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                min="0"
                required
                className="w-full px-4 py-3 border-2 border-ruby-200 rounded-lg focus:border-ruby-500 focus:ring-2 focus:ring-ruby-200 transition-colors duration-200 bg-white/90 text-black"
                placeholder="0"
              />
            </div>
          </div>

          {/* Hidden Category Field */}
          <input 
            type="hidden" 
            id="category" 
            value={formData.category} 
          />

          {/* Botões */}
          <div className="flex space-x-4">
            <Button
              type="submit"
              size="lg"
              className="flex-1 bg-gradient-to-r from-ruby-500 to-ruby-600 hover:from-ruby-600 hover:to-ruby-700 text-black shadow-lg hover:shadow-ruby-200 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">✨</span>
                  {product ? 'Atualizando...' : 'Criando...'}
                </>
              ) : (
                <>
                  {product ? '💾 Atualizar Produto' : '➕ Criar Produto'}
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              size="lg"
              className="flex-1 border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-black"
            >
              ❌ Cancelar
            </Button>
          </div>
        </form>
      </div>

      {/* Dicas */}
      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
        <p className="text-black text-sm">
          💡 <strong>Dica:</strong> Preencha todos os campos para criar um produto completo. 
          O estoque pode ser atualizado posteriormente conforme as vendas.
        </p>
      </div>
    </div>
  )
}

export default ProductForm


