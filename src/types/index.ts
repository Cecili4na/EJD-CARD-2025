// Types centralizados para o projeto
// Este arquivo evita duplicação de tipos e melhora a manutenibilidade

export interface Transaction {
  id: string
  userId: string
  amount: number
  type: 'credit' | 'debit'
  description: string
  createdBy?: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  price: number
  category: 'lojinha' | 'lanchonete'
  description?: string
  stock?: number
  active: boolean
  createdAt: string
}

export interface SaleItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface Sale {
  id: string
  userId: string
  sellerId: string
  category: 'lojinha' | 'lanchonete'
  items: SaleItem[]
  total: number
  status: 'completed' | 'delivered'
  createdAt: string
}

export interface Order {
  id: string
  saleId: string
  userId: string
  customerName: string
  items: SaleItem[]
  total: number
  status: 'pending' | 'completed' | 'delivered'
  createdAt: string
  deliveredAt?: string
}

export interface Card {
  id: string
  userId: string
  userName: string
  cardNumber: string
  phoneNumber: string
  balance: number
  createdAt: string
  updatedAt: string
}
