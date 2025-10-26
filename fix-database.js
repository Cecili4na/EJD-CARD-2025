import Database from 'better-sqlite3'

const db = new Database('./auth.db')

console.log('🔧 Corrigindo banco de dados...\n')

try {
  // Verificar se a coluna role existe
  const tableInfo = db.prepare("PRAGMA table_info(user)").all()
  console.log('📋 Estrutura da tabela user:')
  console.table(tableInfo)

  // Adicionar coluna role se não existir
  try {
    db.exec("ALTER TABLE user ADD COLUMN role TEXT DEFAULT 'user'")
    console.log('✅ Coluna role adicionada')
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ Coluna role já existe')
    } else {
      throw error
    }
  }

  // Atualizar usuários existentes para 'user'
  const updateStmt = db.prepare("UPDATE user SET role = 'user' WHERE role IS NULL OR role = ''")
  const result = updateStmt.run()
  console.log(`✅ ${result.changes} usuários atualizados para 'user'`)

  // Criar um admin
  const adminExists = db.prepare("SELECT * FROM user WHERE email LIKE '%admin%'").get()
  if (!adminExists) {
    const adminId = `admin_${Date.now()}`
    const adminStmt = db.prepare("INSERT INTO user (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)")
    adminStmt.run(adminId, 'admin@encontrao.com', 'Administrador', '123456', 'admin')
    console.log('👑 Admin criado: admin@encontrao.com / 123456')
  }

  // Ver usuários finais
  const users = db.prepare("SELECT * FROM user").all()
  console.log('\n👥 Usuários após correção:')
  console.table(users)

} catch (error) {
  console.error('❌ Erro:', error.message)
} finally {
  db.close()
}

