import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'games.index': { paramsTuple?: []; params?: {} }
    'extensions.index': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'extensions.store': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'extensions.reorder': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'extensions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'extensions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rarities.index': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'rarities.store': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'rarities.reorder': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'rarities.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rarities.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cards.index': { paramsTuple?: []; params?: {} }
    'cards.store': { paramsTuple?: []; params?: {} }
    'cards.import': { paramsTuple?: []; params?: {} }
    'cards.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cards.quantity': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cards.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'openings.index': { paramsTuple?: []; params?: {} }
    'openings.store': { paramsTuple?: []; params?: {} }
    'openings.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'openings.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stats.show': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'games.index': { paramsTuple?: []; params?: {} }
    'extensions.index': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'rarities.index': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'cards.index': { paramsTuple?: []; params?: {} }
    'openings.index': { paramsTuple?: []; params?: {} }
    'stats.show': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'games.index': { paramsTuple?: []; params?: {} }
    'extensions.index': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'rarities.index': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'cards.index': { paramsTuple?: []; params?: {} }
    'openings.index': { paramsTuple?: []; params?: {} }
    'stats.show': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'extensions.store': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'rarities.store': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'cards.store': { paramsTuple?: []; params?: {} }
    'cards.import': { paramsTuple?: []; params?: {} }
    'cards.quantity': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'openings.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'extensions.reorder': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'rarities.reorder': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'cards.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'openings.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'extensions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rarities.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'extensions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rarities.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cards.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'openings.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}