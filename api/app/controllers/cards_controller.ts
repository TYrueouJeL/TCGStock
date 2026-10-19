import Card from '#models/card'
import Extension from '#models/extension'
import Game from '#models/game'
import Rarity from '#models/rarity'
import CardTransformer from '#transformers/card_transformer'
import { assertExtension, assertGame, assertRarity } from '#services/ownership'
import { listValues, sameName } from '#services/list_values'
import { conditionOf, finishOf, gameSlugOf, languageOf } from '#services/import_helpers'
import { cardValidator, importValidator, quantityValidator } from '#validators/card'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

const SORTS: Record<string, [string, 'asc' | 'desc'][]> = {
  recent: [
    ['cards.created_at', 'desc'],
    ['cards.id', 'desc'],
  ],
  name: [['cards.name', 'asc']],
  quantity: [['cards.quantity', 'desc']],
  set: [
    ['extensions.position', 'asc'],
    ['cards.number', 'asc'],
  ],
}

export default class CardsController {
  async index({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { gameId, q, condition, sort } = request.qs()
    const query = Card.query()
      .where('cards.user_id', user.id)
      .preload('extension')
      .preload('rarity')
      .select('cards.*')
      .leftJoin('extensions', 'extensions.id', 'cards.extension_id')
    if (gameId) query.where('cards.game_id', Number(gameId))
    if (condition) query.where('cards.condition', String(condition))
    if (q) {
      const like = `%${String(q).toLowerCase()}%`
      query.where((w) =>
        w
          .whereRaw('lower(cards.name) like ?', [like])
          .orWhereRaw('lower(cards.number) like ?', [like])
          .orWhereRaw('lower(cards.location) like ?', [like])
          .orWhereRaw("lower(coalesce(cards.notes, '')) like ?", [like])
          .orWhereRaw('lower(extensions.name) like ?', [like])
      )
    }
    if (sort === 'value') query.orderByRaw('coalesce(cards.value, 0) * cards.quantity desc')
    else for (const [col, dir] of SORTS[sort] ?? SORTS.recent) query.orderBy(col, dir)
    const cards = await query.limit(10_000)
    return serialize(CardTransformer.transform(cards))
  }

  async store({ auth, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(cardValidator)
    await this.assertRefs(user.id, data)
    const card = await Card.create({ ...data, userId: user.id, notes: data.notes || null })
    await card.load((l) => l.load('extension').load('rarity'))
    response.status(201)
    return serialize(CardTransformer.transform(card))
  }

  async update({ auth, params, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const card = await Card.query().where({ id: params.id, userId: user.id }).firstOrFail()
    const data = await request.validateUsing(cardValidator)
    await this.assertRefs(user.id, data)
    card.merge({ ...data, notes: data.notes || null })
    await card.save()
    await card.load((l) => l.load('extension').load('rarity'))
    return serialize(CardTransformer.transform(card))
  }

  async quantity({ auth, params, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const card = await Card.query().where({ id: params.id, userId: user.id }).firstOrFail()
    const { delta } = await request.validateUsing(quantityValidator)
    card.quantity = Math.max(0, card.quantity + delta)
    await card.save()
    await card.load((l) => l.load('extension').load('rarity'))
    return serialize(CardTransformer.transform(card))
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const card = await Card.query().where({ id: params.id, userId: user.id }).firstOrFail()
    await card.delete()
    return response.noContent()
  }

  /**
   * Bulk import from a spreadsheet. Unknown extensions and rarities are
   * added to the game's lists so every imported card stays editable.
   */
  async import({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { rows } = await request.validateUsing(importValidator)
    const games = await Game.all()
    const bySlug = new Map(games.map((g) => [g.slug, g]))
    let created = 0
    const skipped: { row: number; reason: string }[] = []
    const newLists = { extensions: 0, rarities: 0 }

    await db.transaction(async (trx) => {
      const extCache = new Map<string, Extension>()
      const rarCache = new Map<string, Rarity>()
      const findOrCreate = async (
        model: typeof Extension | typeof Rarity,
        cache: Map<string, any>,
        gameId: number,
        name: string
      ) => {
        const key = `${gameId}:${sameName(name)}`
        if (cache.has(key)) return cache.get(key)
        let row = await listValues.findByName(model, user.id, gameId, name, trx)
        if (!row) {
          const last = await model
            .query({ client: trx })
            .where({ userId: user.id, gameId })
            .max('position as max')
            .first()
          row = await model.create(
            { userId: user.id, gameId, name, position: Number(last?.$extras.max ?? 0) + 1 },
            { client: trx }
          )
          if (model === Extension) newLists.extensions++
          else newLists.rarities++
        }
        cache.set(key, row)
        return row
      }

      for (const [index, row] of rows.entries()) {
        const game = bySlug.get(gameSlugOf(row.game) ?? '')
        if (!game) {
          skipped.push({ row: index + 1, reason: `Jeu inconnu : ${row.game}` })
          continue
        }
        const ext = await findOrCreate(
          Extension,
          extCache,
          game.id,
          row.extension || 'Sans extension'
        )
        const rar = await findOrCreate(Rarity, rarCache, game.id, row.rarity || 'Non précisée')
        await Card.create(
          {
            userId: user.id,
            gameId: game.id,
            extensionId: ext.id,
            rarityId: rar.id,
            name: row.name,
            number: row.number ?? '',
            language: languageOf(row.language),
            condition: conditionOf(row.condition),
            finish: finishOf(row.finish),
            quantity: row.quantity ?? 1,
            purchasePrice: row.purchasePrice ?? null,
            value: row.value ?? null,
            location: row.location ?? '',
            notes: row.notes || null,
          },
          { client: trx }
        )
        created++
      }
    })

    return serialize({ created, skipped, newLists })
  }

  private async assertRefs(
    userId: number,
    data: { gameId: number; extensionId: number; rarityId: number }
  ) {
    await assertGame(data.gameId)
    await assertExtension(userId, data.gameId, data.extensionId)
    await assertRarity(userId, data.gameId, data.rarityId)
  }
}
