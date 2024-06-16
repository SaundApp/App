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
const LeaderboardPostsLazyImport = createFileRoute('/leaderboard/posts')()
const LeaderboardArtistsLazyImport = createFileRoute('/leaderboard/artists')()
const EditProfileLazyImport = createFileRoute('/edit/profile')()
const DmUsernameLazyImport = createFileRoute('/dm/$username')()
const AuthRegisterLazyImport = createFileRoute('/auth/register')()
const AuthLoginLazyImport = createFileRoute('/auth/login')()
const AccountMeLazyImport = createFileRoute('/account/me')()

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

const LeaderboardPostsLazyRoute = LeaderboardPostsLazyImport.update({
  path: '/leaderboard/posts',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/leaderboard/posts.lazy').then((d) => d.Route),
)

const LeaderboardArtistsLazyRoute = LeaderboardArtistsLazyImport.update({
  path: '/leaderboard/artists',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/leaderboard/artists.lazy').then((d) => d.Route),
)

const EditProfileLazyRoute = EditProfileLazyImport.update({
  path: '/edit/profile',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/edit/profile.lazy').then((d) => d.Route))

const DmUsernameLazyRoute = DmUsernameLazyImport.update({
  path: '/dm/$username',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/dm/$username.lazy').then((d) => d.Route))

const AuthRegisterLazyRoute = AuthRegisterLazyImport.update({
  path: '/auth/register',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/auth/register.lazy').then((d) => d.Route))

const AuthLoginLazyRoute = AuthLoginLazyImport.update({
  path: '/auth/login',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/auth/login.lazy').then((d) => d.Route))

const AccountMeLazyRoute = AccountMeLazyImport.update({
  path: '/account/me',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/account/me.lazy').then((d) => d.Route))

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
    '/account/me': {
      id: '/account/me'
      path: '/account/me'
      fullPath: '/account/me'
      preLoaderRoute: typeof AccountMeLazyImport
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
    '/dm/$username': {
      id: '/dm/$username'
      path: '/dm/$username'
      fullPath: '/dm/$username'
      preLoaderRoute: typeof DmUsernameLazyImport
      parentRoute: typeof rootRoute
    }
    '/edit/profile': {
      id: '/edit/profile'
      path: '/edit/profile'
      fullPath: '/edit/profile'
      preLoaderRoute: typeof EditProfileLazyImport
      parentRoute: typeof rootRoute
    }
    '/leaderboard/artists': {
      id: '/leaderboard/artists'
      path: '/leaderboard/artists'
      fullPath: '/leaderboard/artists'
      preLoaderRoute: typeof LeaderboardArtistsLazyImport
      parentRoute: typeof rootRoute
    }
    '/leaderboard/posts': {
      id: '/leaderboard/posts'
      path: '/leaderboard/posts'
      fullPath: '/leaderboard/posts'
      preLoaderRoute: typeof LeaderboardPostsLazyImport
      parentRoute: typeof rootRoute
    }
    '/dm/': {
      id: '/dm/'
      path: '/dm'
      fullPath: '/dm'
      preLoaderRoute: typeof DmIndexLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexLazyRoute,
  NotificationsLazyRoute,
  SearchLazyRoute,
  AccountMeLazyRoute,
  AuthLoginLazyRoute,
  AuthRegisterLazyRoute,
  DmUsernameLazyRoute,
  EditProfileLazyRoute,
  LeaderboardArtistsLazyRoute,
  LeaderboardPostsLazyRoute,
  DmIndexLazyRoute,
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
        "/account/me",
        "/auth/login",
        "/auth/register",
        "/dm/$username",
        "/edit/profile",
        "/leaderboard/artists",
        "/leaderboard/posts",
        "/dm/"
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
    "/account/me": {
      "filePath": "account/me.lazy.tsx"
    },
    "/auth/login": {
      "filePath": "auth/login.lazy.tsx"
    },
    "/auth/register": {
      "filePath": "auth/register.lazy.tsx"
    },
    "/dm/$username": {
      "filePath": "dm/$username.lazy.tsx"
    },
    "/edit/profile": {
      "filePath": "edit/profile.lazy.tsx"
    },
    "/leaderboard/artists": {
      "filePath": "leaderboard/artists.lazy.tsx"
    },
    "/leaderboard/posts": {
      "filePath": "leaderboard/posts.lazy.tsx"
    },
    "/dm/": {
      "filePath": "dm/index.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
