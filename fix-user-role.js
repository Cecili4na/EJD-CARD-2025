import Database from 'better-sqlite3'

const db = new Database('./auth.db')

console.log('🔧 Corrigindo roles de usuários...\n')

try {
  // Ver usuários atuais
  const users = db.prepare("SELECT * FROM user").all()
  console.log('👥 Usuários atuais:')
  console.table(users)

  // Atualizar todos os usuários para 'user' (exceto admins)
  const updateStmt = db.prepare("UPDATE user SET role = 'user' WHERE role = 'guest' OR role IS NULL")
  const result = updateStmt.run()
  
  console.log(`\n✅ ${result.changes} usuários atualizados para 'user'`)

  // Criar um admin se não existir
  const adminExists = db.prepare("SELECT * FROM user WHERE email LIKE '%admin%'").get()
  if (!adminExists) {
    const adminId = `admin_${Date.now()}`
    const adminStmt = db.prepare("INSERT INTO user (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)")
    adminStmt.run(adminId, 'admin@encontrao.com', 'Administrador', '123456', 'admin')
    console.log('👑 Admin criado: admin@encontrao.com / 123456')
  }

  // Ver usuários após atualização
  const updatedUsers = db.prepare("SELECT * FROM user").all()
  console.log('\n👥 Usuários após correção:')
  console.table(updatedUsers)

} catch (error) {
  console.error('❌ Erro:', error.message)
} finally {
  db.close()
}

