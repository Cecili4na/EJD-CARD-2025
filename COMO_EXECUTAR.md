# 🚀 Como Executar o Projeto EJD-CARD-2025

## Pré-requisitos

Você precisa ter o **Node.js** instalado no seu computador. Se ainda não tem, siga estes passos:

### Passo 1: Instalar Node.js

1. Acesse o site oficial: https://nodejs.org/
2. Baixe a versão **LTS (Long Term Support)** - recomendada
3. Execute o instalador e siga as instruções
4. Reinicie o terminal/PowerShell após a instalação

### Passo 2: Verificar a Instalação

Abra um novo terminal ou PowerShell e execute:

```bash
node --version
npm --version
```

Se ambos os comandos retornarem números de versão, a instalação foi bem-sucedida!

## 📦 Instalação do Projeto

### Passo 3: Instalar Dependências

No diretório do projeto, execute:

```bash
npm install
```

Este comando irá instalar todas as dependências listadas no `package.json`. Pode demorar alguns minutos na primeira vez.

## 🎮 Executar o Projeto

### Modo de Desenvolvimento (Recomendado)

Execute o seguinte comando no terminal:

```bash
npm run dev
```

Você verá uma saída similar a:

```
  VITE v4.5.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Passo 4: Abrir no Navegador

1. Abra seu navegador favorito
2. Acesse: **http://localhost:5173/**
3. Você verá a tela de login
4. Faça login para acessar o sistema

## 🏗️ Build de Produção

Para criar uma versão otimizada do projeto:

```bash
npm run build
```

Para visualizar a build de produção localmente:

```bash
npm run preview
```

## 📋 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento com hot reload |
| `npm run build` | Cria build de produção otimizada |
| `npm run preview` | Visualiza a build de produção |
| `npm run lint` | Verifica erros de código com ESLint |

## 🔑 Login

Para acessar o sistema, você pode usar qualquer credencial (o sistema não tem validação real no momento).

## ✨ Funcionalidades

### 📑 Navegação Principal

- **💳 CARTÕES** - Gerenciamento de cartões
- **🏪 LOJINHA** - Produtos da lojinha
- **🍔 LANCHONETE** - Cardápio e pedidos
- **👟 SAPATINHO VELOZES** - Delivery de calçados (NOVO!)

### 👟 Sapatinho Velozes

Nova funcionalidade completa com:

1. **Gerenciamento de Produtos**
   - Criar, editar e deletar produtos
   - Categorias: Sapatos, Tênis, Sandálias, etc.
   - Controle de estoque

2. **Sistema de Vendas**
   - Carrinho de compras
   - IDs únicos para cada venda
   - Calculadora de totais

3. **Histórico de Vendas**
   - Visualização completa de vendas
   - Estatísticas: total de vendas, valor total, ticket médio
   - Busca e filtros

## 🛠️ Solução de Problemas

### Erro: "npm não é reconhecido"

**Solução**: Reinicie o terminal após instalar o Node.js. Se persistir, verifique se o Node.js foi adicionado ao PATH do sistema.

### Erro: "EADDRINUSE: address already in use"

**Solução**: Alguém já está usando a porta 5173. Feche o processo ou use outra porta:

```bash
npm run dev -- --port 3000
```

### Erro: "Cannot find module"

**Solução**: Execute novamente:

```bash
npm install
```

### Porta diferente

Se por algum motivo a porta 5173 estiver ocupada, o Vite automaticamente tentará a próxima porta disponível (5174, 5175, etc.).

## 💡 Dicas

- **Hot Reload**: As mudanças no código são aplicadas automaticamente no navegador
- **Console do Desenvolvedor**: Use `F12` no navegador para ver logs e debugar
- **Modo Escuro**: O sistema detecta automaticamente as preferências do sistema

## 📞 Ajuda

Se tiver problemas:
1. Verifique se o Node.js está instalado corretamente
2. Execute `npm install` novamente
3. Limpe o cache: `npm cache clean --force`
4. Delete a pasta `node_modules` e execute `npm install` novamente

---

**Desenvolvido para o Encontrão 2025 - O Mágico de Oz** ✨



