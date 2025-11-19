/**
 * Sistema de Permissões
 * Valida permissões baseadas em roles
 */

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
  | 'guest'

export type Permission =
  // Cartões
  | 'cards:view_all'
  | 'cards:view_own'
  | 'cards:create'
  | 'cards:update'
  | 'cards:delete'
  | 'cards:add_balance'
  | 'cards:debit_balance'
  | 'cards:view_balance_all'
  | 'cards:view_balance_own'
  // Produtos
  | 'products:view'
  | 'products:create_lojinha'
  | 'products:create_lanchonete'
  | 'products:create_sapatinho'
  | 'products:update_lojinha'
  | 'products:update_lanchonete'
  | 'products:update_sapatinho'
  | 'products:delete_lojinha'
  | 'products:delete_lanchonete'
  | 'products:delete_sapatinho'
  // Vendas
  | 'sales:create_lojinha'
  | 'sales:create_lanchonete'
  | 'sales:create_sapatinho'
  | 'sales:view_history_lojinha'
  | 'sales:view_history_lanchonete'
  | 'sales:view_history_sapatinho'
  | 'sales:view_own'
  // Pedidos
  | 'orders:view'
  | 'orders:mark_delivered'
  // Admin
  | 'admin:manage_users'
  | 'admin:view_reports'
  | 'admin:audit_logs'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Tudo
    'cards:view_all', 'cards:create', 'cards:update', 'cards:delete',
    'cards:add_balance', 'cards:debit_balance', 'cards:view_balance_all',
    'products:view', 'products:create_lojinha', 'products:create_lanchonete', 'products:create_sapatinho',
    'products:update_lojinha', 'products:update_lanchonete', 'products:update_sapatinho',
    'products:delete_lojinha', 'products:delete_lanchonete', 'products:delete_sapatinho',
    'sales:create_lojinha', 'sales:create_lanchonete', 'sales:create_sapatinho',
    'sales:view_history_lojinha', 'sales:view_history_lanchonete', 'sales:view_history_sapatinho',
    'orders:view', 'orders:mark_delivered',
    'admin:manage_users', 'admin:view_reports', 'admin:audit_logs'
  ],
  
  genios_card: [
    // Igual admin
    'cards:view_all', 'cards:create', 'cards:update', 'cards:delete',
    'cards:add_balance', 'cards:debit_balance', 'cards:view_balance_all',
    'products:view', 'products:create_lojinha', 'products:create_lanchonete', 'products:create_sapatinho',
    'products:update_lojinha', 'products:update_lanchonete', 'products:update_sapatinho',
    'products:delete_lojinha', 'products:delete_lanchonete', 'products:delete_sapatinho',
    'sales:create_lojinha', 'sales:create_lanchonete', 'sales:create_sapatinho',
    'sales:view_history_lojinha', 'sales:view_history_lanchonete', 'sales:view_history_sapatinho',
    'orders:view', 'orders:mark_delivered',
    'admin:manage_users', 'admin:view_reports', 'admin:audit_logs'
  ],
  
  coord_lojinha: [
    'cards:view_all', 'cards:view_balance_own',
    'products:view', 'products:create_lojinha', 'products:update_lojinha', 'products:delete_lojinha',
    'sales:create_lojinha', 'sales:view_history_lojinha',
  ],
  
  coord_lanchonete: [
    'cards:view_all', 'cards:view_balance_own',
    'products:view', 'products:create_lanchonete', 'products:update_lanchonete', 'products:delete_lanchonete',
    'sales:create_lanchonete', 'sales:view_history_lanchonete',
  ],
  
  comunicacao: [
    'cards:view_all', 'cards:add_balance', 'cards:view_balance_own',
  ],
  
  vendedor_lojinha: [
    'cards:view_all', 'cards:view_balance_own',
    'products:view',
    'sales:create_lojinha',
  ],
  
  entregador_lojinha: [
    'cards:view_balance_own',
    'orders:view', 'orders:mark_delivered',
  ],
  
  vendedor_lanchonete: [
    'cards:view_all', 'cards:view_balance_own',
    'products:view',
    'sales:create_lanchonete',
  ],
  
  encontrista: [
    'cards:view_own', 'cards:view_balance_own',
    'sales:view_own',
  ],
  
  guest: []
}

/**
 * Verifica se um role tem uma permissão específica
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}

/**
 * Verifica se um role tem qualquer uma das permissões
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

/**
 * Verifica se um role tem todas as permissões
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

/**
 * Helper para verificar permissão de categoria
 */
export function hasPermissionForCategory(
  role: UserRole,
  category: 'lojinha' | 'lanchonete' | 'sapatinho',
  action: 'sell' | 'manage'
): boolean {
  if (role === 'admin' || role === 'genios_card') return true
  
  if (action === 'sell') {
    if (category === 'lojinha') {
      return ['coord_lojinha', 'vendedor_lojinha'].includes(role)
    }
    if (category === 'lanchonete') {
      return ['coord_lanchonete', 'vendedor_lanchonete'].includes(role)
    }
    if (category === 'sapatinho') {
      // TODO: Definir roles para sapatinho
      // Admin e genios_card já foram verificados acima, então retorna false para outros
      return false
    }
  }
  
  return false
}

