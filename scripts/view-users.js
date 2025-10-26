import Database from 'better-sqlite3'

const db = new Database('./auth.db')

console.log('🔍 Usuários cadastrados no Better Auth:\n')

try {
  // Verificar se as tabelas existem
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
  console.log('📋 Tabelas disponíveis:', tables.map(t => t.name))

  // Tentar buscar usuários
  try {
    const users = db.prepare("SELECT * FROM user").all()
    console.log('\n👥 Usuários:')
    console.table(users)
  } catch (err) {
    console.log('❌ Tabela "user" não encontrada ainda')
  }

  // Tentar buscar sessões
  try {
    const sessions = db.prepare("SELECT * FROM session").all()
    console.log('\n🔐 Sessões ativas:')
    console.table(sessions)
  } catch (err) {
    console.log('❌ Tabela "session" não encontrada ainda')
  }

} catch (error) {
  console.error('❌ Erro ao acessar banco:', error.message)
} finally {
  db.close()
}

