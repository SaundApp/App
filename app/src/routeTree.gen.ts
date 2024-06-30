/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const SearchLazyImport = createFileRoute('/search')()
const NotificationsLazyImport = createFileRoute('/notifications')()
const IndexLazyImport = createFileRoute('/')()
const DmIndexLazyImport = createFileRoute('/dm/')()
const LeaderboardArtistsLazyImport = createFileRoute('/leaderboard/artists')()
const AuthRegisterLazyImport = createFileRoute('/auth/register')()
const AuthLoginLazyImport = createFileRoute('/auth/login')()
const AccountSettingsLazyImport = createFileRoute('/account/settings')()
const AccountEditSubscriptionLazyImport = createFileRoute(
  '/account/edit-subscription',
)()
const AccountEditLazyImport = createFileRoute('/account/edit')()
const AccountUsernameLazyImport = createFileRoute('/account/$username')()
const DmIdIndexLazyImport = createFileRoute('/dm/$id/')()
const DmIdSettingsLazyImport = createFileRoute('/dm/$id/settings')()
const AuthPasswordResetLazyImport = createFileRoute('/auth/password/reset')()
const AuthPasswordForgotLazyImport = createFileRoute('/auth/password/forgot')()

// Create/Update Routes

const SearchLazyRoute = SearchLazyImport.update({
  path: '/search',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/search.lazy').then((d) => d.Route))

const NotificationsLazyRoute = NotificationsLazyImport.update({
  path: '/notifications',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/notifications.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const DmIndexLazyRoute = DmIndexLazyImport.update({
  path: '/dm/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/dm/index.lazy').then((d) => d.Route))

const LeaderboardArtistsLazyRoute = LeaderboardArtistsLazyImport.update({
  path: '/leaderboard/artists',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/leaderboard/artists.lazy').then((d) => d.Route),
)

const AuthRegisterLazyRoute = AuthRegisterLazyImport.update({
  path: '/auth/register',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/auth/register.lazy').then((d) => d.Route))

const AuthLoginLazyRoute = AuthLoginLazyImport.update({
  path: '/auth/login',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/auth/login.lazy').then((d) => d.Route))

const AccountSettingsLazyRoute = AccountSettingsLazyImport.update({
  path: '/account/settings',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/account/settings.lazy').then((d) => d.Route),
)

const AccountEditSubscriptionLazyRoute =
  AccountEditSubscriptionLazyImport.update({
    path: '/account/edit-subscription',
    getParentRoute: () => rootRoute,
  } as any).lazy(() =>
    import('./routes/account/edit-subscription.lazy').then((d) => d.Route),
  )

const AccountEditLazyRoute = AccountEditLazyImport.update({
  path: '/account/edit',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/account/edit.lazy').then((d) => d.Route))

const AccountUsernameLazyRoute = AccountUsernameLazyImport.update({
  path: '/account/$username',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/account/$username.lazy').then((d) => d.Route),
)

const DmIdIndexLazyRoute = DmIdIndexLazyImport.update({
  path: '/dm/$id/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/dm/$id/index.lazy').then((d) => d.Route))

const DmIdSettingsLazyRoute = DmIdSettingsLazyImport.update({
  path: '/dm/$id/settings',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/dm/$id/settings.lazy').then((d) => d.Route),
)

const AuthPasswordResetLazyRoute = AuthPasswordResetLazyImport.update({
  path: '/auth/password/reset',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/auth/password/reset.lazy').then((d) => d.Route),
)

const AuthPasswordForgotLazyRoute = AuthPasswordForgotLazyImport.update({
  path: '/auth/password/forgot',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/auth/password/forgot.lazy').then((d) => d.Route),
)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/notifications': {
      id: '/notifications'
      path: '/notifications'
      fullPath: '/notifications'
      preLoaderRoute: typeof NotificationsLazyImport
      parentRoute: typeof rootRoute
    }
    '/search': {
      id: '/search'
      path: '/search'
      fullPath: '/search'
      preLoaderRoute: typeof SearchLazyImport
      parentRoute: typeof rootRoute
    }
    '/account/$username': {
      id: '/account/$username'
      path: '/account/$username'
      fullPath: '/account/$username'
      preLoaderRoute: typeof AccountUsernameLazyImport
      parentRoute: typeof rootRoute
    }
    '/account/edit': {
      id: '/account/edit'
      path: '/account/edit'
      fullPath: '/account/edit'
      preLoaderRoute: typeof AccountEditLazyImport
      parentRoute: typeof rootRoute
    }
    '/account/edit-subscription': {
      id: '/account/edit-subscription'
      path: '/account/edit-subscription'
      fullPath: '/account/edit-subscription'
      preLoaderRoute: typeof AccountEditSubscriptionLazyImport
      parentRoute: typeof rootRoute
    }
    '/account/settings': {
      id: '/account/settings'
      path: '/account/settings'
      fullPath: '/account/settings'
      preLoaderRoute: typeof AccountSettingsLazyImport
      parentRoute: typeof rootRoute
    }
    '/auth/login': {
      id: '/auth/login'
      path: '/auth/login'
      fullPath: '/auth/login'
      preLoaderRoute: typeof AuthLoginLazyImport
      parentRoute: typeof rootRoute
    }
    '/auth/register': {
      id: '/auth/register'
      path: '/auth/register'
      fullPath: '/auth/register'
      preLoaderRoute: typeof AuthRegisterLazyImport
      parentRoute: typeof rootRoute
    }
    '/leaderboard/artists': {
      id: '/leaderboard/artists'
      path: '/leaderboard/artists'
      fullPath: '/leaderboard/artists'
      preLoaderRoute: typeof LeaderboardArtistsLazyImport
      parentRoute: typeof rootRoute
    }
    '/dm/': {
      id: '/dm/'
      path: '/dm'
      fullPath: '/dm'
      preLoaderRoute: typeof DmIndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/auth/password/forgot': {
      id: '/auth/password/forgot'
      path: '/auth/password/forgot'
      fullPath: '/auth/password/forgot'
      preLoaderRoute: typeof AuthPasswordForgotLazyImport
      parentRoute: typeof rootRoute
    }
    '/auth/password/reset': {
      id: '/auth/password/reset'
      path: '/auth/password/reset'
      fullPath: '/auth/password/reset'
      preLoaderRoute: typeof AuthPasswordResetLazyImport
      parentRoute: typeof rootRoute
    }
    '/dm/$id/settings': {
      id: '/dm/$id/settings'
      path: '/dm/$id/settings'
      fullPath: '/dm/$id/settings'
      preLoaderRoute: typeof DmIdSettingsLazyImport
      parentRoute: typeof rootRoute
    }
    '/dm/$id/': {
      id: '/dm/$id/'
      path: '/dm/$id'
      fullPath: '/dm/$id'
      preLoaderRoute: typeof DmIdIndexLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexLazyRoute,
  NotificationsLazyRoute,
  SearchLazyRoute,
  AccountUsernameLazyRoute,
  AccountEditLazyRoute,
  AccountEditSubscriptionLazyRoute,
  AccountSettingsLazyRoute,
  AuthLoginLazyRoute,
  AuthRegisterLazyRoute,
  LeaderboardArtistsLazyRoute,
  DmIndexLazyRoute,
  AuthPasswordForgotLazyRoute,
  AuthPasswordResetLazyRoute,
  DmIdSettingsLazyRoute,
  DmIdIndexLazyRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/notifications",
        "/search",
        "/account/$username",
        "/account/edit",
        "/account/edit-subscription",
        "/account/settings",
        "/auth/login",
        "/auth/register",
        "/leaderboard/artists",
        "/dm/",
        "/auth/password/forgot",
        "/auth/password/reset",
        "/dm/$id/settings",
        "/dm/$id/"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/notifications": {
      "filePath": "notifications.lazy.tsx"
    },
    "/search": {
      "filePath": "search.lazy.tsx"
    },
    "/account/$username": {
      "filePath": "account/$username.lazy.tsx"
    },
    "/account/edit": {
      "filePath": "account/edit.lazy.tsx"
    },
    "/account/edit-subscription": {
      "filePath": "account/edit-subscription.lazy.tsx"
    },
    "/account/settings": {
      "filePath": "account/settings.lazy.tsx"
    },
    "/auth/login": {
      "filePath": "auth/login.lazy.tsx"
    },
    "/auth/register": {
      "filePath": "auth/register.lazy.tsx"
    },
    "/leaderboard/artists": {
      "filePath": "leaderboard/artists.lazy.tsx"
    },
    "/dm/": {
      "filePath": "dm/index.lazy.tsx"
    },
    "/auth/password/forgot": {
      "filePath": "auth/password/forgot.lazy.tsx"
    },
    "/auth/password/reset": {
      "filePath": "auth/password/reset.lazy.tsx"
    },
    "/dm/$id/settings": {
      "filePath": "dm/$id/settings.lazy.tsx"
    },
    "/dm/$id/": {
      "filePath": "dm/$id/index.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
