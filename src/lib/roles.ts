
export type UserRole = 
  | 'admin' 
  | 'genios_card'
  | 'coord_lojinha'
  | 'coord_lanchonete'
  | 'comunicacao'
  | 'vendedor_lojinha'
  | 'entregador_lojinha'
  | 'vendedor_lanchonete'
  | 'encontrista'

export interface RolePermissions {
  // Cartões
  canViewCards: boolean
  canCreateCards: boolean
  canEditCards: boolean
  canDeleteCards: boolean
  
  // Saldo
  canAddBalance: boolean
  canViewOwnBalance: boolean
  canViewAllBalances: boolean
  
  // Produtos
  canManageProductsLojinha: boolean
  canManageProductsLanchonete: boolean
  
  // Vendas (realizar vendas)
  canSellLojinha: boolean
  canSellLanchonete: boolean
  
  // Histórico de vendas (ver relatórios)
  canViewSalesHistoryLojinha: boolean
  canViewSalesHistoryLanchonete: boolean
  
  // Pedidos Lojinha
  canViewOpenOrders: boolean
  canMarkAsDelivered: boolean
  
  // Admin
  canManageUsers: boolean
  canViewAdmin: boolean
  canViewReports: boolean
}

// Definição de permissões por role
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  // Admin - Acesso total
  admin: {
    canViewCards: true,
    canCreateCards: true,
    canEditCards: true,
    canDeleteCards: true,
    canAddBalance: true,
    canViewOwnBalance: true,
    canViewAllBalances: true,
    canManageProductsLojinha: true,
    canManageProductsLanchonete: true,
    canSellLojinha: true,
    canSellLanchonete: true,
    canViewSalesHistoryLojinha: true,
    canViewSalesHistoryLanchonete: true,
    canViewOpenOrders: true,
    canMarkAsDelivered: true,
    canManageUsers: true,
    canViewAdmin: true,
    canViewReports: true,
  },
  
  // Genios Card - Acesso total (igual admin)
  genios_card: {
    canViewCards: true,
    canCreateCards: true,
    canEditCards: true,
    canDeleteCards: true,
    canAddBalance: true,
    canViewOwnBalance: true,
    canViewAllBalances: true,
    canManageProductsLojinha: true,
    canManageProductsLanchonete: true,
    canSellLojinha: true,
    canSellLanchonete: true,
    canViewSalesHistoryLojinha: true,
    canViewSalesHistoryLanchonete: true,
    canViewOpenOrders: true,
    canMarkAsDelivered: true,
    canManageUsers: true,
    canViewAdmin: true,
    canViewReports: true,
  },
  
  // Coordenador Lojinha - Gerenciar produtos lojinha + ver histórico + realizar vendas
  coord_lojinha: {
    canViewCards: true,
    canCreateCards: false,
    canEditCards: false,
    canDeleteCards: false,
    canAddBalance: false,
    canViewOwnBalance: true,
    canViewAllBalances: false,
    canManageProductsLojinha: true,
    canManageProductsLanchonete: false,
    canSellLojinha: true,
    canSellLanchonete: false,
    canViewSalesHistoryLojinha: true,
    canViewSalesHistoryLanchonete: false,
    canViewOpenOrders: false,
    canMarkAsDelivered: false,
    canManageUsers: false,
    canViewAdmin: false,
    canViewReports: false,
  },
  
  // Coordenador Lanchonete - Gerenciar produtos lanchonete + ver histórico + realizar vendas
  coord_lanchonete: {
    canViewCards: true,
    canCreateCards: false,
    canEditCards: false,
    canDeleteCards: false,
    canAddBalance: false,
    canViewOwnBalance: true,
    canViewAllBalances: false,
    canManageProductsLojinha: false,
    canManageProductsLanchonete: true,
    canSellLojinha: false,
    canSellLanchonete: true,
    canViewSalesHistoryLojinha: false,
    canViewSalesHistoryLanchonete: true,
    canViewOpenOrders: false,
    canMarkAsDelivered: false,
    canManageUsers: false,
    canViewAdmin: false,
    canViewReports: false,
  },
  
  // Comunicação - Ver cartões + adicionar saldo
  comunicacao: {
    canViewCards: true,
    canCreateCards: false,
    canEditCards: false,
    canDeleteCards: false,
    canAddBalance: true,
    canViewOwnBalance: true,
    canViewAllBalances: false,
    canManageProductsLojinha: false,
    canManageProductsLanchonete: false,
    canSellLojinha: false,
    canSellLanchonete: false,
    canViewSalesHistoryLojinha: false,
    canViewSalesHistoryLanchonete: false,
    canViewOpenOrders: false,
    canMarkAsDelivered: false,
    canManageUsers: false,
    canViewAdmin: false,
    canViewReports: false,
  },
  
  // Vendedor Lojinha - Realizar vendas lojinha
  vendedor_lojinha: {
    canViewCards: true,
    canCreateCards: false,
    canEditCards: false,
    canDeleteCards: false,
    canAddBalance: false,
    canViewOwnBalance: true,
    canViewAllBalances: false,
    canManageProductsLojinha: false,
    canManageProductsLanchonete: false,
    canSellLojinha: true,
    canSellLanchonete: false,
    canViewSalesHistoryLojinha: false,
    canViewSalesHistoryLanchonete: false,
    canViewOpenOrders: false,
    canMarkAsDelivered: false,
    canManageUsers: false,
    canViewAdmin: false,
    canViewReports: false,
  },
  
  // Entregador Lojinha - Ver pedidos + marcar entregue
  entregador_lojinha: {
    canViewCards: false,
    canCreateCards: false,
    canEditCards: false,
    canDeleteCards: false,
    canAddBalance: false,
    canViewOwnBalance: true,
    canViewAllBalances: false,
    canManageProductsLojinha: false,
    canManageProductsLanchonete: false,
    canSellLojinha: false,
    canSellLanchonete: false,
    canViewSalesHistoryLojinha: false,
    canViewSalesHistoryLanchonete: false,
    canViewOpenOrders: true,
    canMarkAsDelivered: true,
    canManageUsers: false,
    canViewAdmin: false,
    canViewReports: false,
  },
  
  // Vendedor Lanchonete - Realizar vendas lanchonete
  vendedor_lanchonete: {
    canViewCards: true,
    canCreateCards: false,
    canEditCards: false,
    canDeleteCards: false,
    canAddBalance: false,
    canViewOwnBalance: true,
    canViewAllBalances: false,
    canManageProductsLojinha: false,
    canManageProductsLanchonete: false,
    canSellLojinha: false,
    canSellLanchonete: true,
    canViewSalesHistoryLojinha: false,
    canViewSalesHistoryLanchonete: false,
    canViewOpenOrders: false,
    canMarkAsDelivered: false,
    canManageUsers: false,
    canViewAdmin: false,
    canViewReports: false,
  },
  
  // Encontrista - Ver próprio saldo e cartão
  encontrista: {
    canViewCards: true,
    canCreateCards: false,
    canEditCards: false,
    canDeleteCards: false,
    canAddBalance: false,
    canViewOwnBalance: true,
    canViewAllBalances: false,
    canManageProductsLojinha: false,
    canManageProductsLanchonete: false,
    canSellLojinha: false,
    canSellLanchonete: false,
    canViewSalesHistoryLojinha: false,
    canViewSalesHistoryLanchonete: false,
    canViewOpenOrders: false,
    canMarkAsDelivered: false,
    canManageUsers: false,
    canViewAdmin: false,
    canViewReports: false,
  },
}

// Função para obter permissões de um role
export const getUserPermissions = (role: UserRole): RolePermissions => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.encontrista
}

// Função para verificar se um usuário tem uma permissão específica
export const hasPermission = (userRole: UserRole, permission: keyof RolePermissions): boolean => {
  const permissions = getUserPermissions(userRole)
  return permissions[permission]
}

// Função para verificar múltiplas permissões
export const hasAnyPermission = (userRole: UserRole, permissions: (keyof RolePermissions)[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission))
}

// Função para verificar se tem todas as permissões
export const hasAllPermissions = (userRole: UserRole, permissions: (keyof RolePermissions)[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission))
}