import Database from 'better-sqlite3'

const db = new Database('./auth.db')

console.log('🔄 Forçando refresh das permissões...\n')

try {
  // Verificar usuário atual
  const user = db.prepare("SELECT * FROM user WHERE email = 'ana.ceci7373@gmail.com'").get()
  
  if (user) {
    console.log('👤 Usuário atual:')
    console.table([user])
    
    if (user.role === 'admin') {
      console.log('✅ Usuário é admin - deve ter acesso a todas as telas!')
      console.log('\n🎯 Telas que devem aparecer:')
      console.log('  - 💳 Cartões')
      console.log('  - 🏪 Lojinha') 
      console.log('  - 🍔 Lanchonete')
      console.log('  - 👥 Admin')
      
      console.log('\n🔧 Se as telas não aparecem:')
      console.log('1. Faça logout completo')
      console.log('2. Limpe o cache (Ctrl+F5)')
      console.log('3. Faça login novamente')
      console.log('4. Verifique o console do navegador (F12)')
    } else {
      console.log(`❌ Usuário é ${user.role}, não admin!`)
      console.log('🔧 Corrigindo...')
      
      const updateStmt = db.prepare("UPDATE user SET role = 'admin' WHERE email = 'ana.ceci7373@gmail.com'")
      updateStmt.run()
      
      console.log('✅ Corrigido! Agora é admin!')
    }
  } else {
    console.log('❌ Usuário não encontrado!')
  }

} catch (error) {
  console.error('❌ Erro:', error.message)
} finally {
  db.close()
}

