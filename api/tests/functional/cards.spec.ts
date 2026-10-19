import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { firstRarity, game, makeExtension, makeUser, expectStatus } from '#tests/helpers'

test.group('Cards', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function payload(user: Awaited<ReturnType<typeof makeUser>>) {
    const op = await game('onepiece')
    const ext = await makeExtension(user, 'onepiece')
    const rarity = await firstRarity(user, 'onepiece')
    return {
      gameId: op.id,
      extensionId: ext.id,
      rarityId: rarity.id,
      name: 'Monkey D. Luffy',
      number: 'OP01-024',
      language: 'JP',
      condition: 'NM',
      finish: 'Alt Art',
      quantity: 2,
      location: 'Classeur 1',
    }
  }

  test('creates a card when every required field is there', async ({ client, assert }) => {
    const user = await makeUser()
    const res = await client
      .post('/api/v1/cards')
      .loginAs(user)
      .json({ ...(await payload(user)), value: 55.5 })
    res.assertStatus(201)
    assert.equal((res.body() as any).data.value, 55.5)
    assert.isNull((res.body() as any).data.purchasePrice)
    assert.equal((res.body() as any).data.rarityName, 'C')
  })

  test('refuses a card with a missing required field', async ({ client, assert }) => {
    const user = await makeUser()
    const { location, number, ...rest } = await payload(user)
    const res = await client.post('/api/v1/cards').loginAs(user).json(rest)
    res.assertStatus(422)
    const fields = (res.body() as any).errors.map((e: any) => e.field)
    assert.includeMembers(fields, ['location', 'number'])
  })

  test('refuses an extension from another game or another user', async ({ client }) => {
    const user = await makeUser()
    const other = await makeUser()
    const base = await payload(user)
    const foreign = await makeExtension(other, 'onepiece', 'Autre')
    const pokemonExt = await makeExtension(user, 'pokemon', 'Évolutions Prismatiques')
    await expectStatus(
      client
        .post('/api/v1/cards')
        .loginAs(user)
        .json({ ...base, extensionId: foreign.id }),
      422
    )
    await expectStatus(
      client
        .post('/api/v1/cards')
        .loginAs(user)
        .json({ ...base, extensionId: pokemonExt.id }),
      422
    )
  })

  test('changes the quantity without going below zero', async ({ client, assert }) => {
    const user = await makeUser()
    const created = await client
      .post('/api/v1/cards')
      .loginAs(user)
      .json(await payload(user))
    const id = (created.body() as any).data.id
    const plus = await client.post(`/api/v1/cards/${id}/quantity`).loginAs(user).json({ delta: 1 })
    assert.equal((plus.body() as any).data.quantity, 3)
    const minus = await client
      .post(`/api/v1/cards/${id}/quantity`)
      .loginAs(user)
      .json({ delta: -10 })
    assert.equal((minus.body() as any).data.quantity, 0)
  })

  test('another user cannot see or edit my cards', async ({ client, assert }) => {
    const user = await makeUser()
    const other = await makeUser()
    const created = await client
      .post('/api/v1/cards')
      .loginAs(user)
      .json(await payload(user))
    const id = (created.body() as any).data.id
    const list = await client.get('/api/v1/cards').loginAs(other)
    assert.lengthOf((list.body() as any).data, 0)
    await expectStatus(client.delete(`/api/v1/cards/${id}`).loginAs(other), 404)
  })

  test('import reuses existing values whatever the case or accents', async ({ client, assert }) => {
    const user = await makeUser()
    await makeExtension(user, 'pokemon', 'Évolutions Prismatiques')
    const res = await client
      .post('/api/v1/cards/import')
      .loginAs(user)
      .json({
        rows: [
          {
            game: 'pokemon',
            name: 'Pikachu',
            extension: 'ÉVOLUTIONS prismatiques',
            rarity: 'commune',
          },
        ],
      })
    res.assertStatus(200)
    assert.deepEqual((res.body() as any).data.newLists, { extensions: 0, rarities: 0 })
  })

  test('import adds missing extensions and rarities to the lists', async ({ client, assert }) => {
    const user = await makeUser()
    const res = await client
      .post('/api/v1/cards/import')
      .loginAs(user)
      .json({
        rows: [
          {
            game: 'Pokémon',
            name: 'Pikachu',
            extension: 'Évolutions Prismatiques',
            rarity: 'Commune',
            condition: 'Near Mint',
            quantity: 4,
            value: 0.5,
          },
          {
            game: 'pokemon',
            name: 'Évoli ex',
            extension: 'évolutions prismatiques',
            rarity: 'Illustration Spéciale Rare',
          },
          { game: 'Magic', name: 'Black Lotus' },
        ],
      })
    res.assertStatus(200)
    assert.equal((res.body() as any).data.created, 2)
    assert.lengthOf((res.body() as any).data.skipped, 1)
    assert.deepEqual((res.body() as any).data.newLists, { extensions: 1, rarities: 0 })
    const pk = await game('pokemon')
    const exts = await client.get(`/api/v1/games/${pk.id}/extensions`).loginAs(user)
    assert.equal((exts.body() as any).data[0].cardCount, 2)
  })

  test('importing the same export again updates quantities instead of duplicating', async ({
    client,
    assert,
  }) => {
    const user = await makeUser()
    const rows = (quantity: number) => [
      {
        game: 'wankul',
        name: 'Jeu de vitres',
        extension: 'Legacy',
        number: 'T#003',
        rarity: 'Terrain',
        quantity,
      },
      { game: 'wankul', name: 'Cuisine', extension: 'Legacy', number: 'T#008', quantity: 1 },
    ]
    const first = await client
      .post('/api/v1/cards/import')
      .loginAs(user)
      .json({ rows: rows(1) })
    assert.equal((first.body() as any).data.created, 2)

    const again = await client
      .post('/api/v1/cards/import')
      .loginAs(user)
      .json({ rows: [...rows(3), { ...rows(3)[1], quantity: 2 }] })
    assert.equal((again.body() as any).data.created, 0)
    assert.equal((again.body() as any).data.updated, 2)

    const wk = await game('wankul')
    const res = await client.get(`/api/v1/cards?gameId=${wk.id}&sort=name`).loginAs(user)
    const list = (res.body() as any).data ?? res.body()
    assert.deepEqual(
      list.map((c: any) => [c.name, c.quantity]),
      [
        ['Cuisine', 3],
        ['Jeu de vitres', 3],
      ]
    )
  })
})
