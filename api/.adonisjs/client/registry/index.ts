/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"signup"]],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"login"]],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [[0,"api"],[0,"v1"],[0,"account"],[0,"profile"]],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [[0,"api"],[0,"v1"],[0,"account"],[0,"logout"]],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
  'games.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/games',
    tokens: [[0,"api"],[0,"v1"],[0,"games"]],
    types: placeholder as Registry['games.index']['types'],
  },
  'extensions.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/games/:gameId/extensions',
    tokens: [[0,"api"],[0,"v1"],[0,"games"],[1,"gameId"],[0,"extensions"]],
    types: placeholder as Registry['extensions.index']['types'],
  },
  'extensions.store': {
    methods: ["POST"],
    pattern: '/api/v1/games/:gameId/extensions',
    tokens: [[0,"api"],[0,"v1"],[0,"games"],[1,"gameId"],[0,"extensions"]],
    types: placeholder as Registry['extensions.store']['types'],
  },
  'extensions.reorder': {
    methods: ["PUT"],
    pattern: '/api/v1/games/:gameId/extensions/order',
    tokens: [[0,"api"],[0,"v1"],[0,"games"],[1,"gameId"],[0,"extensions"],[0,"order"]],
    types: placeholder as Registry['extensions.reorder']['types'],
  },
  'extensions.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/extensions/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"extensions"],[1,"id"]],
    types: placeholder as Registry['extensions.update']['types'],
  },
  'extensions.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/extensions/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"extensions"],[1,"id"]],
    types: placeholder as Registry['extensions.destroy']['types'],
  },
  'rarities.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/games/:gameId/rarities',
    tokens: [[0,"api"],[0,"v1"],[0,"games"],[1,"gameId"],[0,"rarities"]],
    types: placeholder as Registry['rarities.index']['types'],
  },
  'rarities.store': {
    methods: ["POST"],
    pattern: '/api/v1/games/:gameId/rarities',
    tokens: [[0,"api"],[0,"v1"],[0,"games"],[1,"gameId"],[0,"rarities"]],
    types: placeholder as Registry['rarities.store']['types'],
  },
  'rarities.reorder': {
    methods: ["PUT"],
    pattern: '/api/v1/games/:gameId/rarities/order',
    tokens: [[0,"api"],[0,"v1"],[0,"games"],[1,"gameId"],[0,"rarities"],[0,"order"]],
    types: placeholder as Registry['rarities.reorder']['types'],
  },
  'rarities.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/rarities/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"rarities"],[1,"id"]],
    types: placeholder as Registry['rarities.update']['types'],
  },
  'rarities.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/rarities/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"rarities"],[1,"id"]],
    types: placeholder as Registry['rarities.destroy']['types'],
  },
  'cards.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/cards',
    tokens: [[0,"api"],[0,"v1"],[0,"cards"]],
    types: placeholder as Registry['cards.index']['types'],
  },
  'cards.store': {
    methods: ["POST"],
    pattern: '/api/v1/cards',
    tokens: [[0,"api"],[0,"v1"],[0,"cards"]],
    types: placeholder as Registry['cards.store']['types'],
  },
  'cards.import': {
    methods: ["POST"],
    pattern: '/api/v1/cards/import',
    tokens: [[0,"api"],[0,"v1"],[0,"cards"],[0,"import"]],
    types: placeholder as Registry['cards.import']['types'],
  },
  'cards.update': {
    methods: ["PUT"],
    pattern: '/api/v1/cards/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"cards"],[1,"id"]],
    types: placeholder as Registry['cards.update']['types'],
  },
  'cards.quantity': {
    methods: ["POST"],
    pattern: '/api/v1/cards/:id/quantity',
    tokens: [[0,"api"],[0,"v1"],[0,"cards"],[1,"id"],[0,"quantity"]],
    types: placeholder as Registry['cards.quantity']['types'],
  },
  'cards.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/cards/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"cards"],[1,"id"]],
    types: placeholder as Registry['cards.destroy']['types'],
  },
  'openings.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/openings',
    tokens: [[0,"api"],[0,"v1"],[0,"openings"]],
    types: placeholder as Registry['openings.index']['types'],
  },
  'openings.store': {
    methods: ["POST"],
    pattern: '/api/v1/openings',
    tokens: [[0,"api"],[0,"v1"],[0,"openings"]],
    types: placeholder as Registry['openings.store']['types'],
  },
  'openings.update': {
    methods: ["PUT"],
    pattern: '/api/v1/openings/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"openings"],[1,"id"]],
    types: placeholder as Registry['openings.update']['types'],
  },
  'openings.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/openings/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"openings"],[1,"id"]],
    types: placeholder as Registry['openings.destroy']['types'],
  },
  'stats.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/stats',
    tokens: [[0,"api"],[0,"v1"],[0,"stats"]],
    types: placeholder as Registry['stats.show']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
