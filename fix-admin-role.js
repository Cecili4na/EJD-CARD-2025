import Database from 'better-sqlite3'

const db = new Database('./auth.db')

console.log('🔧 Verificando e corrigindo role do admin...\n')

try {
  // Verificar usuário atual
  const user = db.prepare("SELECT * FROM user WHERE email = 'ana.ceci7373@gmail.com'").get()
  
  if (user) {
    console.log('👤 Usuário encontrado:')
    console.table([user])
    
    if (user.role !== 'admin') {
      console.log(`❌ Role atual: ${user.role}`)
      console.log('🔧 Corrigindo para admin...')
      
      const updateStmt = db.prepare("UPDATE user SET role = 'admin' WHERE email = 'ana.ceci7373@gmail.com'")
      updateStmt.run()
      
      console.log('✅ Role corrigido para admin!')
    } else {
      console.log('✅ Role já está correto: admin')
    }
    
    // Verificar sessões ativas
    const sessions = db.prepare("SELECT * FROM session WHERE userId = ?").all(user.id)
    console.log(`\n📊 Sessões ativas: ${sessions.length}`)
    
    if (sessions.length > 0) {
      console.log('🗑️ Removendo sessões antigas...')
      const deleteStmt = db.prepare("DELETE FROM session WHERE userId = ?")
      deleteStmt.run(user.id)
      console.log('✅ Sessões removidas')
    }
    
  } else {
    console.log('❌ Usuário não encontrado!')
  }

  // Ver resultado final
  const finalUser = db.prepare("SELECT * FROM user WHERE email = 'ana.ceci7373@gmail.com'").get()
  console.log('\n👤 Usuário após correção:')
  console.table([finalUser])

} catch (error) {
  console.error('❌ Erro:', error.message)
} finally {
  db.close()
}

