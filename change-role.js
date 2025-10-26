import Database from 'better-sqlite3'

const db = new Database('./auth.db')

console.log('🔧 Alterando role de usuário...\n')

try {
  // Ver usuários atuais
  const users = db.prepare("SELECT * FROM user").all()
  console.log('👥 Usuários atuais:')
  console.table(users)

  // Alterar role da Ana para admin
  const updateStmt = db.prepare("UPDATE user SET role = ? WHERE email = ?")
  const result = updateStmt.run('admin', 'ana.ceci7373@gmail.com')
  
  console.log(`\n✅ ${result.changes} usuário(s) atualizado(s)`)

  // Ver resultado
  const updatedUsers = db.prepare("SELECT * FROM user").all()
  console.log('\n👥 Usuários após alteração:')
  console.table(updatedUsers)

} catch (error) {
  console.error('❌ Erro:', error.message)
} finally {
  db.close()
}

