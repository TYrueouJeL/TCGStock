/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { name: 'TCGStock API', status: 'ok' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    /**
     * Everything below belongs to the signed-in user.
     */
    router
      .group(() => {
        router.get('games', [controllers.Games, 'index'])

        router.get('games/:gameId/extensions', [controllers.Extensions, 'index'])
        router.post('games/:gameId/extensions', [controllers.Extensions, 'store'])
        router.put('games/:gameId/extensions/order', [controllers.Extensions, 'reorder'])
        router.patch('extensions/:id', [controllers.Extensions, 'update'])
        router.delete('extensions/:id', [controllers.Extensions, 'destroy'])

        router.get('games/:gameId/rarities', [controllers.Rarities, 'index'])
        router.post('games/:gameId/rarities', [controllers.Rarities, 'store'])
        router.put('games/:gameId/rarities/order', [controllers.Rarities, 'reorder'])
        router.patch('rarities/:id', [controllers.Rarities, 'update'])
        router.delete('rarities/:id', [controllers.Rarities, 'destroy'])

        router.get('cards', [controllers.Cards, 'index'])
        router.post('cards', [controllers.Cards, 'store'])
        router.post('cards/import', [controllers.Cards, 'import'])
        router.put('cards/:id', [controllers.Cards, 'update'])
        router.post('cards/:id/quantity', [controllers.Cards, 'quantity'])
        router.delete('cards/:id', [controllers.Cards, 'destroy'])

        router.get('openings', [controllers.Openings, 'index'])
        router.post('openings', [controllers.Openings, 'store'])
        router.put('openings/:id', [controllers.Openings, 'update'])
        router.delete('openings/:id', [controllers.Openings, 'destroy'])

        router.get('stats', [controllers.Stats, 'show'])
      })
      .use(middleware.auth())
  })
  .prefix('/api/v1')
