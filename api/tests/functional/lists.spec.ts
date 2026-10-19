import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Card from '#models/card'
import { firstRarity, game, makeExtension, makeUser, expectStatus } from '#tests/helpers'

test.group('Extensions and rarities', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('signup gives every game its default rarities', async ({ client, assert }) => {
    const res = await client.post('/api/v1/auth/signup').json({
      fullName: null,
      email: 'new@test.dev',
      password: 'secret-password',
      passwordConfirmation: 'secret-password',
    })
    res.assertStatus(200)
    const token = (res.body() as any).data.token
    const op = await game('onepiece')
    const list = await client.get(`/api/v1/games/${op.id}/rarities`).bearerToken(token)
    list.assertStatus(200)
    assert.deepEqual(
      (list.body() as any).data.map((r: any) => r.name),
      ['C', 'UC', 'R', 'SR', 'SEC', 'L', 'SP', 'TR', 'P']
    )
  })

  test('lists are separate per game and per user', async ({ client, assert }) => {
    const alice = await makeUser()
    const bob = await makeUser()
    const op = await game('onepiece')
    const pk = await game('pokemon')
    await expectStatus(
      client
        .post(`/api/v1/games/${op.id}/extensions`)
        .loginAs(alice)
        .json({ name: 'OP-01 Romance Dawn' }),
      201
    )

    const aliceOp = await client.get(`/api/v1/games/${op.id}/extensions`).loginAs(alice)
    const alicePk = await client.get(`/api/v1/games/${pk.id}/extensions`).loginAs(alice)
    const bobOp = await client.get(`/api/v1/games/${op.id}/extensions`).loginAs(bob)
    assert.lengthOf((aliceOp.body() as any).data, 1)
    assert.lengthOf((alicePk.body() as any).data, 0)
    assert.lengthOf((bobOp.body() as any).data, 0)
  })

  test('rejects a duplicate name in the same game', async ({ client }) => {
    const user = await makeUser()
    const op = await game('onepiece')
    await expectStatus(
      client
        .post(`/api/v1/games/${op.id}/extensions`)
        .loginAs(user)
        .json({ name: 'Paramount War' }),
      201
    )
    await expectStatus(
      client
        .post(`/api/v1/games/${op.id}/extensions`)
        .loginAs(user)
        .json({ name: 'paramount war' }),
      409
    )
  })

  test('renaming keeps cards attached, deleting a used value is refused', async ({
    client,
    assert,
  }) => {
    const user = await makeUser()
    const op = await game('onepiece')
    const ext = await makeExtension(user, 'onepiece')
    const rarity = await firstRarity(user, 'onepiece')
    const card = await Card.create({
      userId: user.id,
      gameId: op.id,
      extensionId: ext.id,
      rarityId: rarity.id,
      name: 'Luffy',
      number: 'OP01-024',
      language: 'FR',
      condition: 'NM',
      finish: 'Normale',
      quantity: 1,
      location: 'Classeur 1',
    })

    await expectStatus(
      client
        .patch(`/api/v1/extensions/${ext.id}`)
        .loginAs(user)
        .json({ name: 'OP-01 Romance Dawn' }),
      200
    )
    const cards = await client.get('/api/v1/cards').loginAs(user)
    assert.equal((cards.body() as any).data[0].extensionName, 'OP-01 Romance Dawn')

    await expectStatus(client.delete(`/api/v1/extensions/${ext.id}`).loginAs(user), 409)
    await expectStatus(client.delete(`/api/v1/rarities/${rarity.id}`).loginAs(user), 409)
    await card.delete()
    await expectStatus(client.delete(`/api/v1/extensions/${ext.id}`).loginAs(user), 204)
  })

  test('reorders values', async ({ client, assert }) => {
    const user = await makeUser()
    const pk = await game('pokemon')
    const list = await client.get(`/api/v1/games/${pk.id}/rarities`).loginAs(user)
    const ids = (list.body() as any).data.map((r: any) => r.id).reverse()
    await expectStatus(
      client.put(`/api/v1/games/${pk.id}/rarities/order`).loginAs(user).json({ ids }),
      204
    )
    const after = await client.get(`/api/v1/games/${pk.id}/rarities`).loginAs(user)
    assert.deepEqual(
      (after.body() as any).data.map((r: any) => r.id),
      ids
    )
  })

  test('requires authentication', async ({ client }) => {
    await expectStatus(client.get('/api/v1/cards'), 401)
  })
})
