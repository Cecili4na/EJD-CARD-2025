// Script para limpar cache e forçar atualização
console.log('🧹 Limpando cache do navegador...')

// Limpar localStorage
if (typeof localStorage !== 'undefined') {
  localStorage.clear()
  console.log('✅ localStorage limpo')
}

// Limpar sessionStorage
if (typeof sessionStorage !== 'undefined') {
  sessionStorage.clear()
  console.log('✅ sessionStorage limpo')
}

// Forçar reload da página
if (typeof window !== 'undefined') {
  window.location.reload(true)
  console.log('🔄 Página recarregada')
}

