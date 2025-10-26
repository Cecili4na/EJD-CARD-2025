import Database from 'better-sqlite3'

const db = new Database('./auth.db')

console.log('🔍 Testando acesso do admin...\n')

try {
  // Verificar se Ana Cecilia é admin
  const user = db.prepare("SELECT * FROM user WHERE email = 'ana.ceci7373@gmail.com'").get()
  
  if (user) {
    console.log('👤 Usuário encontrado:')
    console.table([user])
    
    if (user.role === 'admin') {
      console.log('✅ Ana Cecilia é ADMIN!')
      console.log('✅ Deve ter acesso a TODAS as telas:')
      console.log('  - 💳 Cartões: ✅ Ver, criar, editar, deletar')
      console.log('  - 🏪 Lojinha: ✅ Ver e gerenciar')
      console.log('  - 🍔 Lanchonete: ✅ Ver e gerenciar')
      console.log('  - 👥 Admin: ✅ Ver e gerenciar usuários')
      console.log('  - 📊 Relatórios: ✅ Ver tudo')
    } else {
      console.log(`❌ Ana Cecilia é ${user.role}, não admin!`)
      console.log('🔧 Corrigindo...')
      
      const updateStmt = db.prepare("UPDATE user SET role = 'admin' WHERE email = 'ana.ceci7373@gmail.com'")
      updateStmt.run()
      
      console.log('✅ Corrigido! Ana Cecilia agora é ADMIN!')
    }
  } else {
    console.log('❌ Usuário não encontrado!')
  }

  // Ver todos os usuários
  const allUsers = db.prepare("SELECT * FROM user").all()
  console.log('\n👥 Todos os usuários:')
  console.table(allUsers)

} catch (error) {
  console.error('❌ Erro:', error.message)
} finally {
  db.close()
}

