// Serviço para gerenciar produtos no localStorage

export interface Product {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  context: 'lojinha' | 'lanchonete'
  createdAt: string
  updatedAt: string
}

class ProductService {
  private getStorageKey(context: 'lojinha' | 'lanchonete'): string {
    return `products_${context}`
  }

  // Obter todos os produtos de um contexto
  getProducts(context: 'lojinha' | 'lanchonete'): Product[] {
    try {
      const key = this.getStorageKey(context)
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Erro ao obter produtos:', error)
      return []
    }
  }

  // Obter um produto específico por ID
  getProductById(context: 'lojinha' | 'lanchonete', id: string): Product | null {
    const products = this.getProducts(context)
    return products.find(p => p.id === id) || null
  }

  // Adicionar novo produto
  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    // Gerar ID único usando timestamp + random
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newProduct: Product = {
      ...product,
      id: uniqueId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const products = this.getProducts(product.context)
    products.push(newProduct)
    
    const key = this.getStorageKey(product.context)
    localStorage.setItem(key, JSON.stringify(products))
    
    return newProduct
  }

  // Atualizar produto existente
  updateProduct(context: 'lojinha' | 'lanchonete', id: string, updates: Partial<Omit<Product, 'id' | 'context' | 'createdAt'>>): Product | null {
    const products = this.getProducts(context)
    const index = products.findIndex(p => p.id === id)
    
    if (index === -1) return null
    
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    const key = this.getStorageKey(context)
    localStorage.setItem(key, JSON.stringify(products))
    
    return products[index]
  }

  // Excluir produto
  deleteProduct(context: 'lojinha' | 'lanchonete', id: string): boolean {
    const products = this.getProducts(context)
    const filteredProducts = products.filter(p => p.id !== id)
    
    if (filteredProducts.length === products.length) {
      return false // Produto não encontrado
    }
    
    const key = this.getStorageKey(context)
    localStorage.setItem(key, JSON.stringify(filteredProducts))
    
    return true
  }

  // Limpar todos os produtos de um contexto (útil para testes)
  clearProducts(context: 'lojinha' | 'lanchonete'): void {
    const key = this.getStorageKey(context)
    localStorage.removeItem(key)
  }

  // Inicializar com produtos de exemplo (mock)
  initializeMockProducts(context: 'lojinha' | 'lanchonete'): void {
    const existingProducts = this.getProducts(context)
    if (existingProducts.length > 0) return // Já tem produtos

    const mockProducts = context === 'lojinha' ? [
      {
        name: 'Camiseta Mágica de Oz',
        price: 49.90,
        quantity: 15,
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23a855f7" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="60"%3E👕%3C/text%3E%3C/svg%3E',
        context: context as 'lojinha' | 'lanchonete'
      },
      {
        name: 'Chapéu do Espantalho',
        price: 35.50,
        quantity: 8,
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%2310b981" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="60"%3E🎩%3C/text%3E%3C/svg%3E',
        context: context as 'lojinha' | 'lanchonete'
      },
      {
        name: 'Sapatinhos de Rubi',
        price: 99.99,
        quantity: 5,
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23dc2626" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="60"%3E👠%3C/text%3E%3C/svg%3E',
        context: context as 'lojinha' | 'lanchonete'
      },
      {
        name: 'Coração de Lata',
        price: 15.00,
        quantity: 20,
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%233b82f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="60"%3E❤️%3C/text%3E%3C/svg%3E',
        context: context as 'lojinha' | 'lanchonete'
      }
    ] : [
      {
        name: 'Hambúrguer de Esmeralda',
        price: 25.90,
        quantity: 30,
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%2310b981" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="60"%3E🍔%3C/text%3E%3C/svg%3E',
        context: context as 'lojinha' | 'lanchonete'
      },
      {
        name: 'Pizza do Caminho Amarelo',
        price: 45.00,
        quantity: 12,
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23fbbf24" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="60"%3E🍕%3C/text%3E%3C/svg%3E',
        context: context as 'lojinha' | 'lanchonete'
      },
      {
        name: 'Milk-shake de Arco-íris',
        price: 12.50,
        quantity: 25,
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ec4899" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="60"%3E🥤%3C/text%3E%3C/svg%3E',
        context: context as 'lojinha' | 'lanchonete'
      },
      {
        name: 'Batata Frita Mágica',
        price: 8.90,
        quantity: 40,
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f97316" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="60"%3E🍟%3C/text%3E%3C/svg%3E',
        context: context as 'lojinha' | 'lanchonete'
      }
    ]

    mockProducts.forEach(product => this.addProduct(product))
  }
}

export const productService = new ProductService()

