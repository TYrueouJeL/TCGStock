/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractRawResponse, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_tokens.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.access_tokens.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/account/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
    }
  }
  'games.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/games'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/games_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/games_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/games_controller').default['index']>>>
    }
  }
  'extensions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/games/:gameId/extensions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { gameId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['index']>>>
    }
  }
  'extensions.store': {
    methods: ["POST"]
    pattern: '/api/v1/games/:gameId/extensions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/catalog').createExtensionValidator)>>
      paramsTuple: [ParamValue]
      params: { gameId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/catalog').createExtensionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'extensions.reorder': {
    methods: ["PUT"]
    pattern: '/api/v1/games/:gameId/extensions/order'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/catalog').reorderValidator)>>
      paramsTuple: [ParamValue]
      params: { gameId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/catalog').reorderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['reorder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['reorder']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['reorder']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'extensions.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/extensions/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/catalog').updateExtensionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/catalog').updateExtensionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'extensions.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/extensions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/extensions_controller').default['destroy']>>>
    }
  }
  'rarities.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/games/:gameId/rarities'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { gameId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['index']>>>
    }
  }
  'rarities.store': {
    methods: ["POST"]
    pattern: '/api/v1/games/:gameId/rarities'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/catalog').createRarityValidator)>>
      paramsTuple: [ParamValue]
      params: { gameId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/catalog').createRarityValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'rarities.reorder': {
    methods: ["PUT"]
    pattern: '/api/v1/games/:gameId/rarities/order'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/catalog').reorderValidator)>>
      paramsTuple: [ParamValue]
      params: { gameId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/catalog').reorderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['reorder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['reorder']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['reorder']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'rarities.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/rarities/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/catalog').updateRarityValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/catalog').updateRarityValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'rarities.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/rarities/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/rarities_controller').default['destroy']>>>
    }
  }
  'cards.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/cards'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['index']>>>
    }
  }
  'cards.store': {
    methods: ["POST"]
    pattern: '/api/v1/cards'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/card').cardValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/card').cardValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cards.import': {
    methods: ["POST"]
    pattern: '/api/v1/cards/import'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/card').importValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/card').importValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['import']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['import']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['import']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cards.update': {
    methods: ["PUT"]
    pattern: '/api/v1/cards/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/card').cardValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/card').cardValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cards.quantity': {
    methods: ["POST"]
    pattern: '/api/v1/cards/:id/quantity'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/card').quantityValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/card').quantityValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['quantity']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['quantity']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['quantity']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cards.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/cards/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['destroy']>>>
    }
  }
  'openings.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/openings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/openings_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/openings_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/openings_controller').default['index']>>>
    }
  }
  'openings.store': {
    methods: ["POST"]
    pattern: '/api/v1/openings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/opening').openingValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/opening').openingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/openings_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/openings_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/openings_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'openings.update': {
    methods: ["PUT"]
    pattern: '/api/v1/openings/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/opening').openingValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/opening').openingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/openings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/openings_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/openings_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'openings.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/openings/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/openings_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/openings_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/openings_controller').default['destroy']>>>
    }
  }
  'stats.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/opening').statsFilterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stats_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stats_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/stats_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
