/* eslint-disable */
// @ts-nocheck
// Arquivo temporário - será regenerado automaticamente pelo TanStack Router

import { Route as rootRouteImport } from './routes/__root'
import { Route as LayoutRouteImport } from './routes/_layout/index'
import { Route as LoginRouteImport } from './routes/login'
import { Route as IndexRouteImport } from './routes/index'
import { Route as MycardRouteImport } from './routes/_layout/mycard'
import { Route as LojinhaRouteImport } from './routes/_layout/lojinha'
import { Route as LanchoneteRouteImport } from './routes/_layout/lanchonete'
import { Route as AdminRouteImport } from './routes/_layout/admin'
import { Route as PedidosLojinhaRouteImport } from './routes/_layout/pedidos-lojinha'
import { Route as CardsIndexRouteImport } from './routes/_layout/cards/index'
import { Route as CardsAddRouteImport } from './routes/_layout/cards/add'
import { Route as CardsAssociateRouteImport } from './routes/_layout/cards/associate'
import { Route as CardsBalanceRouteImport } from './routes/_layout/cards/balance'
import { Route as CardsCreateRouteImport } from './routes/_layout/cards/create'
import { Route as CardsDebitRouteImport } from './routes/_layout/cards/debit'
import { Route as VendasLojinhaRouteImport } from './routes/_layout/vendas/lojinha'
import { Route as VendasLanchoneteRouteImport } from './routes/_layout/vendas/lanchonete'
import { Route as HistoricoLojinhaRouteImport } from './routes/_layout/historico/lojinha'
import { Route as HistoricoLanchoneteRouteImport } from './routes/_layout/historico/lanchonete'

const rootRoute = rootRouteImport
const LayoutRoute = LayoutRouteImport.update({
  id: '/_layout',
  getParentRoute: () => rootRoute,
} as any)
const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)
const MycardRoute = MycardRouteImport.update({
  id: '/_layout/mycard',
  path: '/mycard',
  getParentRoute: () => LayoutRoute,
} as any)
const LojinhaRoute = LojinhaRouteImport.update({
  id: '/_layout/lojinha',
  path: '/lojinha',
  getParentRoute: () => LayoutRoute,
} as any)
const LanchoneteRoute = LanchoneteRouteImport.update({
  id: '/_layout/lanchonete',
  path: '/lanchonete',
  getParentRoute: () => LayoutRoute,
} as any)
const AdminRoute = AdminRouteImport.update({
  id: '/_layout/admin',
  path: '/admin',
  getParentRoute: () => LayoutRoute,
} as any)
const PedidosLojinhaRoute = PedidosLojinhaRouteImport.update({
  id: '/_layout/pedidos-lojinha',
  path: '/pedidos-lojinha',
  getParentRoute: () => LayoutRoute,
} as any)
const CardsIndexRoute = CardsIndexRouteImport.update({
  id: '/_layout/cards/',
  path: '/cards',
  getParentRoute: () => LayoutRoute,
} as any)
const CardsAddRoute = CardsAddRouteImport.update({
  id: '/_layout/cards/add',
  path: '/cards/add',
  getParentRoute: () => LayoutRoute,
} as any)
const CardsAssociateRoute = CardsAssociateRouteImport.update({
  id: '/_layout/cards/associate',
  path: '/cards/associate',
  getParentRoute: () => LayoutRoute,
} as any)
const CardsBalanceRoute = CardsBalanceRouteImport.update({
  id: '/_layout/cards/balance',
  path: '/cards/balance',
  getParentRoute: () => LayoutRoute,
} as any)
const CardsCreateRoute = CardsCreateRouteImport.update({
  id: '/_layout/cards/create',
  path: '/cards/create',
  getParentRoute: () => LayoutRoute,
} as any)
const CardsDebitRoute = CardsDebitRouteImport.update({
  id: '/_layout/cards/debit',
  path: '/cards/debit',
  getParentRoute: () => LayoutRoute,
} as any)
const VendasLojinhaRoute = VendasLojinhaRouteImport.update({
  id: '/_layout/vendas/lojinha',
  path: '/vendas/lojinha',
  getParentRoute: () => LayoutRoute,
} as any)
const VendasLanchoneteRoute = VendasLanchoneteRouteImport.update({
  id: '/_layout/vendas/lanchonete',
  path: '/vendas/lanchonete',
  getParentRoute: () => LayoutRoute,
} as any)
const HistoricoLojinhaRoute = HistoricoLojinhaRouteImport.update({
  id: '/_layout/historico/lojinha',
  path: '/historico/lojinha',
  getParentRoute: () => LayoutRoute,
} as any)
const HistoricoLanchoneteRoute = HistoricoLanchoneteRouteImport.update({
  id: '/_layout/historico/lanchonete',
  path: '/historico/lanchonete',
  getParentRoute: () => LayoutRoute,
} as any)

export const routeTree = rootRoute.addChildren([
  LayoutRoute.addChildren([
    MycardRoute,
    LojinhaRoute,
    LanchoneteRoute,
    AdminRoute,
    PedidosLojinhaRoute,
    CardsIndexRoute,
    CardsAddRoute,
    CardsAssociateRoute,
    CardsBalanceRoute,
    CardsCreateRoute,
    CardsDebitRoute,
    VendasLojinhaRoute,
    VendasLanchoneteRoute,
    HistoricoLojinhaRoute,
    HistoricoLanchoneteRoute,
  ]),
  LoginRoute,
  IndexRoute,
])

