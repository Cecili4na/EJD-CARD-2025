import Database from 'better-sqlite3'

const db = new Database('./auth.db')

console.log('🔧 Alterando SEU role para admin...\n')

try {
  // Alterar SUA conta para admin
  const updateStmt = db.prepare("UPDATE user SET role = 'admin' WHERE email = 'ana.ceci7373@gmail.com'")
  const result = updateStmt.run()
  
  if (result.changes > 0) {
    console.log('✅ Ana Cecilia agora é ADMIN!')
  } else {
    console.log('❌ Conta não encontrada')
  }

  // Ver resultado
  const user = db.prepare("SELECT * FROM user WHERE email = 'ana.ceci7373@gmail.com'").get()
  console.log('\n👤 Sua conta:')
  console.table([user])

} catch (error) {
  console.error('❌ Erro:', error.message)
} finally {
  db.close()
}

