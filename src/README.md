# Estrutura do Projeto - Sistema de Paginação

## 📁 Organização de Arquivos

### 🎭 **Componentes Compartilhados** (`components/shared/`)
Componentes reutilizáveis em múltiplas páginas:
- `Button.tsx` - Botão personalizado com variantes
- `Card.tsx` - Card container reutilizável
- `Header.tsx` - Header com logo e navegação
- `BackButton.tsx` - Botão de voltar padronizado
- `index.ts` - Exportações centralizadas

### 🎨 **Componentes UI** (`components/ui/`)
Componentes de interface específicos:
- `Login.tsx` - Tela de login
- `TabNavigation.tsx` - Navegação por abas
- `index.ts` - Exportações centralizadas

### 💳 **Páginas de Cartões** (`pages/cards/`)
Componentes específicos para gerenciamento de cartões:
- `CreateCard.tsx` - Criação de cartões
- `CheckBalance.tsx` - Consulta de saldo
- `AddValue.tsx` - Inserção de valores
- `DebitCard.tsx` - Débito de cartões
- `index.ts` - Exportações centralizadas

### 🏪 **Páginas da Lojinha** (`pages/lojinha/`)
Componentes específicos para a lojinha:
- `LojinhaStore.tsx` - Componente principal da lojinha
- `ProductList.tsx` - Lista de produtos
- `ProductForm.tsx` - Formulário de produtos
- `ProductView.tsx` - Visualização de produtos
- `index.ts` - Exportações centralizadas

### 🍔 **Páginas da Lanchonete** (`pages/lanchonete/`)
Componentes específicos para a lanchonete:
- `LanchoneteStore.tsx` - Componente principal da lanchonete
- `ProductList.tsx` - Lista de produtos/cardápio
- `ProductForm.tsx` - Formulário de produtos
- `ProductView.tsx` - Visualização de produtos
- `index.ts` - Exportações centralizadas

## 🚀 **Como Usar**

### Importações Simplificadas:
```typescript
// Componentes compartilhados
import { Button, Card, Header } from './components/shared'

// Componentes UI
import { Login, TabNavigation } from './components/ui'

// Páginas de cartões
import { CreateCard, CheckBalance } from './pages/cards'

// Páginas da lojinha
import { LojinhaStore } from './pages/lojinha'

// Páginas da lanchonete
import { LanchoneteStore } from './pages/lanchonete'
```

### Benefícios da Nova Estrutura:

1. **🎯 Organização Clara** - Cada página tem seus próprios componentes
2. **♻️ Reutilização** - Componentes compartilhados centralizados
3. **📦 Importações Limpas** - Usando arquivos de índice
4. **🔧 Manutenibilidade** - Fácil localização e edição
5. **📈 Escalabilidade** - Estrutura preparada para crescimento

## 🎨 **Padrões de Design**

### Componentes Compartilhados:
- Estilo consistente em todo o sistema
- Props flexíveis e reutilizáveis
- Seguem a identidade visual do Encontrão 2025

### Componentes de Página:
- Específicos para cada contexto
- Reutilizam componentes compartilhados
- Mantêm consistência visual

### Navegação:
- Headers com botões de voltar
- Navegação por abas
- Fluxo intuitivo entre páginas