#!/usr/bin/env node

/**
 * Teste Local de Funções Serverless
 * 
 * Simula chamadas às serverless functions sem precisar do Vercel CLI
 * Útil para debug rápido
 */

// Mock do ambiente Vercel
process.env.NODE_ENV = 'development'

async function testFunction(functionPath, method = 'GET', options = {}) {
  console.log(`\n🧪 Testando: ${functionPath}`)
  console.log(`   Método: ${method}`)
  
  try {
    // Importar a função
    const handler = await import(functionPath)
    const fn = handler.default
    
    // Mock de request e response
    const mockReq = {
      method,
      url: options.url || '/test',
      headers: options.headers || {},
      query: options.query || {},
      body: options.body || {}
    }
    
    let responseData = {
      statusCode: 200,
      body: null,
      headers: {}
    }
    
    const mockRes = {
      status(code) {
        responseData.statusCode = code
        return this
      },
      json(data) {
        responseData.body = data
        return this
      },
      setHeader(key, value) {
        responseData.headers[key] = value
        return this
      }
    }
    
    // Executar a função
    await fn(mockReq, mockRes)
    
    // Mostrar resultado
    const statusColor = responseData.statusCode === 200 ? '\x1b[32m' : 
                        responseData.statusCode === 404 ? '\x1b[31m' : '\x1b[33m'
    
    console.log(`${statusColor}   Status: ${responseData.statusCode}\x1b[0m`)
    console.log('   Resposta:')
    console.log('   ', JSON.stringify(responseData.body, null, 2).replace(/\n/g, '\n    '))
    
    return responseData
    
  } catch (error) {
    console.log('\x1b[31m   ❌ Erro ao executar função:\x1b[0m')
    console.log('   ', error.message)
    console.log('   ', error.stack)
  }
}

async function main() {
  console.log('\x1b[34m========================================\x1b[0m')
  console.log('\x1b[34m🧪 Teste Local de Funções Serverless\x1b[0m')
  console.log('\x1b[34m========================================\x1b[0m')
  
  // Teste 1: Endpoint de teste
  await testFunction('./api/cards/test.ts', 'GET', {
    url: '/api/cards/test',
    query: {}
  })
  
  // Teste 2: List (sem token - deve dar 401)
  await testFunction('./api/cards/list.ts', 'GET', {
    url: '/api/cards/list',
    query: {}
  })
  
  // Teste 3: My Card (sem token - deve dar 401)
  await testFunction('./api/cards/my-card.ts', 'GET', {
    url: '/api/cards/my-card',
    query: {}
  })
  
  console.log('\n\x1b[34m========================================\x1b[0m')
  console.log('\x1b[32m✅ Testes concluídos!\x1b[0m')
  console.log('\x1b[34m========================================\x1b[0m')
  console.log('\n💡 Para testar com autenticação, use o Vercel CLI:')
  console.log('   \x1b[33mvercel dev\x1b[0m')
  console.log('\nOu rode o servidor Express:')
  console.log('   \x1b[33mnode server/index.ts\x1b[0m\n')
}

main().catch(console.error)

