import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { game, makeExtension, makeUser } from '#tests/helpers'

test.group('Openings and stats', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('records openings and validates them', async ({ client, assert }) => {
    const user = await makeUser()
    const op = await game('onepiece')
    const ext = await makeExtension(user, 'onepiece')
    const ok = await client.post('/api/v1/openings').loginAs(user).json({
      gameId: op.id,
      extensionId: ext.id,
      productType: 'booster',
      quantity: 3,
      unitPrice: 5.5,
      openedOn: '2026-10-01',
    })
    ok.assertStatus(201)
    assert.equal((ok.body() as any).data.openedOn, '2026-10-01')

    const bad = await client
      .post('/api/v1/openings')
      .loginAs(user)
      .json({ gameId: op.id, extensionId: ext.id, productType: 'coffret', quantity: 0 })
    bad.assertStatus(422)
    assert.includeMembers(
      (bad.body() as any).errors.map((e: any) => e.field),
      ['productType', 'quantity', 'openedOn']
    )
  })

  test('computes stats per type, game, extension and month', async ({ client, assert }) => {
    const user = await makeUser()
    const op = await game('onepiece')
    const pk = await game('pokemon')
    const opExt = await makeExtension(user, 'onepiece')
    const pkExt = await makeExtension(user, 'pokemon', 'Évolutions Prismatiques')
    const post = (body: object) => client.post('/api/v1/openings').loginAs(user).json(body)
    await post({
      gameId: op.id,
      extensionId: opExt.id,
      productType: 'booster',
      quantity: 4,
      unitPrice: 5,
      pulledValue: 12,
      openedOn: '2026-09-10',
    })
    await post({
      gameId: op.id,
      extensionId: opExt.id,
      productType: 'display',
      quantity: 1,
      unitPrice: 110,
      pulledValue: 150,
      openedOn: '2026-10-02',
    })
    await post({
      gameId: pk.id,
      extensionId: pkExt.id,
      productType: 'booster',
      quantity: 6,
      openedOn: '2026-10-05',
    })
    await post({
      gameId: pk.id,
      extensionId: pkExt.id,
      productType: 'starter_deck',
      quantity: 1,
      unitPrice: 15,
      openedOn: '2026-10-06',
    })

    const res = await client.get('/api/v1/stats').loginAs(user)
    res.assertStatus(200)
    const s = (res.body() as any).data.openings
    assert.deepEqual(s.totals.items, { booster: 10, display: 1, starter_deck: 1 })
    assert.equal(s.totals.sessions, 4)
    assert.equal(s.totals.spent, 145)
    assert.equal(s.totals.pulled, 162)
    assert.equal(s.totals.balance, 17)
    const booster = s.byType.find((t: any) => t.type === 'booster')
    assert.equal(booster.averagePrice, 5) // only priced boosters count
    assert.deepEqual(
      s.byMonth.map((m: any) => m.month),
      ['2026-09', '2026-10']
    )
    assert.equal(s.byExtension[0].name, 'Évolutions Prismatiques')

    const filtered = await client
      .get('/api/v1/stats')
      .qs({ gameId: op.id, from: '2026-10-01' })
      .loginAs(user)
    assert.deepEqual((filtered.body() as any).data.openings.totals.items, {
      booster: 0,
      display: 1,
      starter_deck: 0,
    })
  })
})
