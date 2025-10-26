import { Product, Transaction } from '../contexts/DataContext'

// Dados de exemplo para teste do sistema
export const seedProducts: Product[] = [
  // Produtos Lojinha
  {
    id: 'prod_lojinha_1',
    name: 'Camiseta Encontrão 2025',
    price: 25.00,
    category: 'lojinha',
    description: 'Camiseta oficial do Encontrão 2025 - O Mágico de Oz',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_lojinha_2',
    name: 'Caneca Personalizada',
    price: 15.00,
    category: 'lojinha',
    description: 'Caneca com logo do evento',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_lojinha_3',
    name: 'Chaveiro Especial',
    price: 5.00,
    category: 'lojinha',
    description: 'Chaveiro exclusivo do Encontrão',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_lojinha_4',
    name: 'Boné Encontrão',
    price: 20.00,
    category: 'lojinha',
    description: 'Boné com bordado do evento',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_lojinha_5',
    name: 'Adesivo Pack',
    price: 3.00,
    category: 'lojinha',
    description: 'Pack com 5 adesivos temáticos',
    active: true,
    createdAt: new Date().toISOString()
  },

  // Produtos Lanchonete
  {
    id: 'prod_lanchonete_1',
    name: 'Hambúrguer Artesanal',
    price: 12.00,
    category: 'lanchonete',
    description: 'Hambúrguer com carne artesanal, queijo, alface e tomate',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_lanchonete_2',
    name: 'Refrigerante Lata',
    price: 4.00,
    category: 'lanchonete',
    description: 'Refrigerante lata 350ml - Coca-Cola, Pepsi, Fanta',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_lanchonete_3',
    name: 'Batata Frita',
    price: 8.00,
    category: 'lanchonete',
    description: 'Porção média de batata frita crocante',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_lanchonete_4',
    name: 'Hot Dog Completo',
    price: 10.00,
    category: 'lanchonete',
    description: 'Hot dog com salsicha, molho, queijo e batata palha',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_lanchonete_5',
    name: 'Água Mineral',
    price: 2.50,
    category: 'lanchonete',
    description: 'Água mineral 500ml',
    active: true,
    createdAt: new Date().toISOString()
  }
]

// Usuários de exemplo com diferentes roles
export const seedUsers = [
  {
    id: 'admin_1',
    email: 'admin@encontrao.com',
    name: 'Administrador',
    role: 'admin'
  },
  {
    id: 'genios_1',
    email: 'genios@encontrao.com',
    name: 'Genios Card',
    role: 'genios_card'
  },
  {
    id: 'coord_lojinha_1',
    email: 'coord_lojinha@encontrao.com',
    name: 'Coordenador Lojinha',
    role: 'coord_lojinha'
  },
  {
    id: 'coord_lanchonete_1',
    email: 'coord_lanchonete@encontrao.com',
    name: 'Coordenador Lanchonete',
    role: 'coord_lanchonete'
  },
  {
    id: 'comunicacao_1',
    email: 'comunicacao@encontrao.com',
    name: 'Equipe Comunicação',
    role: 'comunicacao'
  },
  {
    id: 'vendedor_lojinha_1',
    email: 'vendedor_lojinha@encontrao.com',
    name: 'Vendedor Lojinha',
    role: 'vendedor_lojinha'
  },
  {
    id: 'entregador_1',
    email: 'entregador@encontrao.com',
    name: 'Entregador',
    role: 'entregador_lojinha'
  },
  {
    id: 'vendedor_lanchonete_1',
    email: 'vendedor_lanchonete@encontrao.com',
    name: 'Vendedor Lanchonete',
    role: 'vendedor_lanchonete'
  },
  {
    id: 'encontrista_1',
    email: 'joao@encontrao.com',
    name: 'João Silva',
    role: 'encontrista'
  },
  {
    id: 'encontrista_2',
    email: 'maria@encontrao.com',
    name: 'Maria Santos',
    role: 'encontrista'
  },
  {
    id: 'encontrista_3',
    email: 'pedro@encontrao.com',
    name: 'Pedro Costa',
    role: 'encontrista'
  }
]

// Transações de exemplo para alguns usuários
export const seedTransactions: Transaction[] = [
  {
    id: 'tx_encontrista_1',
    userId: 'encontrista_1',
    amount: 50.00,
    type: 'credit',
    description: 'Saldo inicial',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx_encontrista_2',
    userId: 'encontrista_2',
    amount: 30.00,
    type: 'credit',
    description: 'Saldo inicial',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx_encontrista_3',
    userId: 'encontrista_3',
    amount: 75.00,
    type: 'credit',
    description: 'Saldo inicial',
    createdAt: new Date().toISOString()
  }
]

// Função para criar dados de seed completos
export const createSeedData = () => {
  return {
    products: {
      lojinha: seedProducts.filter(p => p.category === 'lojinha'),
      lanchonete: seedProducts.filter(p => p.category === 'lanchonete')
    },
    users: seedUsers,
    transactions: seedTransactions,
    sales: [],
    orders: []
  }
}

// Função para resetar dados (útil para admin)
export const resetSeedData = () => {
  localStorage.removeItem('encontrao_data')
  window.location.reload()
}

