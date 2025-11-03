import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Header, ConfirmationModal } from '../../components/shared'
import { useToastContext } from '../../contexts/ToastContext'
import { productService, Product as ProductType } from '../../services/productService'
import OptimizedImage from '../../components/ui/OptimizedImage';

interface Product {
  id: string  // alterado de number para string
  name: string
  price: number
  stock: number,
  description?: string
  image_url?: string | null
  // ...outros campos...
}

const ListProductsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { showSuccess, showError, showInfo } = useToastContext()
  
  // Determinar o contexto baseado na rota (lojinha ou lanchonete)
  const context = location.pathname.startsWith('/lojinha') ? 'lojinha' : 'lanchonete'
  
  const [products, setProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const itemsPerPage = 6

  // Configurações específicas por contexto
  const config = {
    lojinha: {
      title: '📋 LISTAR PRODUTOS',
      subtitle: 'Gerencie os produtos da lojinha',
      emptyMessage: 'Nenhum produto cadastrado na lojinha',
      deleteTitle: 'Excluir Produto',
      deleteMessage: 'Deseja realmente excluir este produto?'
    },
    lanchonete: {
      title: '📋 LISTAR CARDÁPIO',
      subtitle: 'Gerencie os itens do cardápio',
      emptyMessage: 'Nenhum item cadastrado no cardápio',
      deleteTitle: 'Excluir Item',
      deleteMessage: 'Deseja realmente excluir este item do cardápio?'
    }
  }
  
  const currentConfig = config[context]

  // Carregar produtos
  useEffect(() => {
    loadProducts()
    // Resetar para a primeira página ao mudar de contexto
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context])

  const loadProducts = async () => {
    // Inicializar produtos mock se não houver produtos
    const loadedProducts = await productService.getProducts(context)
    console.log('Produtos carregados:', loadedProducts)
    setProducts(loadedProducts || [])
    // Resetar para a primeira página ao recarregar produtos
    setCurrentPage(1)
  }

  // Calcular paginação
  const totalPages = Math.ceil(products.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem)

  // Debug temporário (remover depois)
  // console.log('Paginação Debug:', {
  //   totalProdutos: products.length,
  //   paginaAtual: currentPage,
  //   totalPaginas: totalPages,
  //   indexInicio: indexOfFirstItem,
  //   indexFim: indexOfLastItem,
  //   produtosPagina: currentProducts.length,
  //   produtos: currentProducts.map(p => p.name)
  // })

  // Debug: verificar se a página atual é válida
  useEffect(() => {
    if (products.length > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [products.length, currentPage, totalPages])

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEdit = (product: Product) => {
    if (product.id) {
      navigate(`/${context}/products/edit/${product.id}`)
    } else {
      showError('Erro', 'ID do produto não encontrado')
    }
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
  }

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      const success = await productService.deleteProduct(context, productToDelete.id)
      if (success) {
        await loadProducts()
        showSuccess('Sucesso', context === 'lojinha' ? 'Produto excluído com sucesso!' : 'Item excluído com sucesso!')
        setProductToDelete(null)
      } else {
        showError('Erro', 'Falha ao excluir item.')
      }
    }
  }

  const handleCancelDelete = () => {
    setProductToDelete(null)
    showInfo('Cancelado', 'Exclusão cancelada.')
  }

  const formatPrice = (price: number): string => {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Adicione esta função para obter imagem padrão
  const getDefaultImage = (context: 'lojinha' | 'lanchonete'): string => {
    const svg = context === 'lanchonete' 
      ? `<svg>...</svg>` // seu SVG da lanchonete atual
      : `<svg>...</svg>` // seu SVG da lojinha atual
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header 
        title={currentConfig.title}
        subtitle={currentConfig.subtitle}
        showLogo={false}
      />

      {/* Lista de Produtos */}
      {products.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-4 font-cardinal">
            {currentConfig.emptyMessage}
          </h3>
          <p className="text-gray-500 mb-6 font-farmhand">
            Comece cadastrando seu primeiro {context === 'lojinha' ? 'produto' : 'item'}!
          </p>
          <button
            onClick={() => navigate(`/${context}/products/create`)}
            className="px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black hover:shadow-xl"
          >
            ➕ Cadastrar {context === 'lojinha' ? 'Produto' : 'Item'}
          </button>
        </div>
      ) : (
        <>
          {/* Grid de Produtos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                <OptimizedImage
                src={product.image_url || getDefaultImage(context)}
                alt={product.name}
                className="h-48 bg-gradient-to-br from-gray-100 to-gray-200"
                context={context}
              />
                {/* Informações do Produto */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-emerald-600 mb-2 font-cardinal truncate" title={product.name}>
                    {product.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-farmhand">💰 Preço:</span>
                      <span className="text-lg font-bold text-sky-900 font-cardinal">
                        R$ {formatPrice(product.price)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-farmhand">📦 Quantidade:</span>
                      <span className={`font-bold font-cardinal ${product.stock > 10 ? 'text-emerald-600' : product.stock > 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {product.stock}
                      </span>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-xl"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="flex-1 px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-xl"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: currentPage === 1 ? '#d1d5db' : '#eab308',
                  color: '#000000'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = '#ca8a04'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = '#eab308'
                  }
                }}
              >
                ← Anterior
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    data-btn-type="page-number"
                    data-active={currentPage === page ? "true" : "false"}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      currentPage === page 
                        ? 'bg-sky-200 hover:bg-sky-300 shadow-lg' 
                        : 'bg-white hover:bg-emerald-100 shadow'
                    }`}
                    style={{ 
                      minWidth: '40px'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: currentPage === totalPages ? '#d1d5db' : '#10b981',
                  color: '#000000'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.backgroundColor = '#059669'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.backgroundColor = '#10b981'
                  }
                }}
              >
                Próximo →
              </button>
            </div>
          )}

          {/* Informações de Paginação */}
          <div className="text-center text-gray-600 font-farmhand">
            Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, products.length)} de {products.length} {context === 'lojinha' ? 'produtos' : 'itens'}
          </div>
        </>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={!!productToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={currentConfig.deleteTitle}
        icon="⚠️"
        message={currentConfig.deleteMessage}
        variant="delete-product"
        product={productToDelete ? {
          id: String(productToDelete.id),
          name: productToDelete.name,
          price: productToDelete.price,
          stock: productToDelete.stock,
          description: productToDelete.description
        } : null}
      />
    </div>
  )
}

export default ListProductsPage

