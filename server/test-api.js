/**
 * Script de Teste da API (Node.js)
 * Testa todos os endpoints da API Express
 * 
 * Uso: node server/test-api.js [TOKEN]
 */

const API_URL = 'http://localhost:3001'

// Cores para terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testEndpoint(name, method, path, options = {}) {
  try {
    const url = `${API_URL}${path}`
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(options.token && { Authorization: `Bearer ${options.token}` }),
        ...options.headers,
      },
      ...(options.body && { body: JSON.stringify(options.body) }),
    })

    const data = await response.json().catch(() => ({ error: 'Invalid JSON' }))

    return {
      success: response.ok,
      status: response.status,
      data,
    }
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message,
    }
  }
}

async function runTests(token = null) {
  log('\n🧪 Testando API Express...\n', 'blue')

  // Teste 1: Health Check
  log('1️⃣  Testando Health Check...', 'yellow')
  const health = await testEndpoint('Health', 'GET', '/health')
  if (health.success && health.status === 200) {
    log(`   ✅ Health Check OK - ${JSON.stringify(health.data)}`, 'green')
  } else {
    log(`   ❌ Health Check FALHOU - Status: ${health.status}`, 'red')
  }
  console.log('')

  // Teste 2: Autenticação sem token
  log('2️⃣  Testando autenticação (sem token)...', 'yellow')
  const noToken = await testEndpoint('Sales List', 'GET', '/api/sales/list')
  if (noToken.status === 401) {
    log(`   ✅ Autenticação funcionando (bloqueou requisição sem token)`, 'green')
    log(`   Response: ${JSON.stringify(noToken.data)}`, 'green')
  } else {
    log(`   ❌ Autenticação FALHOU - Status: ${noToken.status} (esperado: 401)`, 'red')
  }
  console.log('')

  // Teste 3: Autenticação com token inválido
  log('3️⃣  Testando autenticação (token inválido)...', 'yellow')
  const invalidToken = await testEndpoint('Sales List', 'GET', '/api/sales/list', {
    token: 'token-invalido-123',
  })
  if (invalidToken.status === 401) {
    log(`   ✅ Autenticação funcionando (bloqueou token inválido)`, 'green')
    log(`   Response: ${JSON.stringify(invalidToken.data)}`, 'green')
  } else {
    log(`   ❌ Autenticação FALHOU - Status: ${invalidToken.status} (esperado: 401)`, 'red')
  }
  console.log('')

  // Teste 4: Criar venda sem token
  log('4️⃣  Testando criar venda (sem token)...', 'yellow')
  const createNoToken = await testEndpoint('Create Sale', 'POST', '/api/sales/create', {
    body: {
      cardNumber: '123',
      category: 'lojinha',
      items: [],
    },
  })
  if (createNoToken.status === 401) {
    log(`   ✅ Endpoint protegido (bloqueou sem token)`, 'green')
  } else {
    log(`   ❌ Endpoint não está protegido! - Status: ${createNoToken.status} (esperado: 401)`, 'red')
  }
  console.log('')

  // Teste 5: Validação de dados (se token fornecido)
  if (token) {
    log('5️⃣  Testando validação de dados (com token)...', 'yellow')
    
    // Teste com dados inválidos
    const invalidData = await testEndpoint('Create Sale Invalid', 'POST', '/api/sales/create', {
      token,
      body: {
        cardNumber: '',
        category: 'invalid',
        items: [],
      },
    })
    
    if (invalidData.status === 400) {
      log(`   ✅ Validação funcionando (bloqueou dados inválidos)`, 'green')
      log(`   Response: ${JSON.stringify(invalidData.data)}`, 'green')
    } else {
      log(`   ⚠️  Status: ${invalidData.status}`, 'yellow')
      log(`   Response: ${JSON.stringify(invalidData.data)}`, 'yellow')
    }
    console.log('')

    // Teste listar vendas com token válido
    log('6️⃣  Testando listar vendas (com token válido)...', 'yellow')
    const salesList = await testEndpoint('Sales List', 'GET', '/api/sales/list', {
      token,
    })
    
    if (salesList.success) {
      log(`   ✅ Listagem funcionando`, 'green')
      log(`   Total de vendas: ${Array.isArray(salesList.data) ? salesList.data.length : 'N/A'}`, 'green')
    } else {
      log(`   ⚠️  Status: ${salesList.status}`, 'yellow')
      log(`   Response: ${JSON.stringify(salesList.data)}`, 'yellow')
    }
    console.log('')
  } else {
    log('5️⃣  Testando validação de dados...', 'yellow')
    log('   ⚠️  Token não fornecido - pulando testes que requerem autenticação', 'yellow')
    log('   Para testar com token:', 'yellow')
    log('   1. Faça login no frontend', 'yellow')
    log('   2. Abra DevTools > Application > Local Storage', 'yellow')
    log('   3. Copie o token do Supabase', 'yellow')
    log('   4. Execute: node server/test-api.js SEU_TOKEN_AQUI', 'yellow')
    console.log('')
  }

  // Resumo
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  log('📋 Resumo dos Testes', 'blue')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  console.log('')
  log('✅ Testes básicos concluídos!', 'green')
  console.log('')
}

// Executar testes
const token = process.argv[2] || null
runTests(token).catch(console.error)

