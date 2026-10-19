import db from '@adonisjs/lucid/services/db'
import Extension from '#models/extension'
import type Rarity from '#models/rarity'

type ListModel = typeof Extension | typeof Rarity

export const sameName = (name: string) => name.trim().toLocaleLowerCase('fr').normalize('NFC')

/**
 * Shared logic for the per-game lists (extensions and rarities):
 * listing with usage counts, ordering and duplicate checks.
 */
export const listValues = {
  async index(model: ListModel, userId: number, gameId: number) {
    const rows = await model.query().where({ userId, gameId }).orderBy('position').orderBy('id')
    const fk = model === Extension ? 'extension_id' : 'rarity_id'
    const cardCounts = await db
      .from('cards')
      .where('user_id', userId)
      .where('game_id', gameId)
      .groupBy(fk)
      .select(fk)
      .count('* as total')
    const openingCounts =
      model === Extension
        ? await db
            .from('openings')
            .where('user_id', userId)
            .where('game_id', gameId)
            .groupBy('extension_id')
            .select('extension_id')
            .count('* as total')
        : []
    const cardsBy = new Map(cardCounts.map((r: any) => [Number(r[fk]), Number(r.total)]))
    const openingsBy = new Map(
      openingCounts.map((r: any) => [Number(r.extension_id), Number(r.total)])
    )
    return rows.map((row) => ({
      id: row.id,
      gameId: row.gameId,
      name: row.name,
      code: row instanceof Extension ? row.code : undefined,
      position: row.position,
      cardCount: cardsBy.get(row.id) ?? 0,
      openingCount: openingsBy.get(row.id) ?? 0,
    }))
  },

  /**
   * Case-insensitive lookup done in JavaScript: SQLite's lower() ignores
   * accented letters ("É"), which are common in set names.
   */
  async findByName(model: ListModel, userId: number, gameId: number, name: string, client?: any) {
    const key = sameName(name)
    const rows = await model.query(client ? { client } : {}).where({ userId, gameId })
    return rows.find((row) => sameName(row.name) === key) ?? null
  },

  async nameTaken(
    model: ListModel,
    userId: number,
    gameId: number,
    name: string,
    exceptId?: number
  ) {
    const row = await this.findByName(model, userId, gameId, name)
    return !!row && row.id !== exceptId
  },

  async nextPosition(model: ListModel, userId: number, gameId: number) {
    const last = await model.query().where({ userId, gameId }).max('position as max').first()
    return Number(last?.$extras.max ?? 0) + 1
  },

  /**
   * Rewrites positions in the order given. Ids that are not the user's for
   * this game are ignored, and values left out keep their relative order
   * after the listed ones.
   */
  async reorder(model: ListModel, userId: number, gameId: number, ids: number[]) {
    const rows = await model.query().where({ userId, gameId }).orderBy('position').orderBy('id')
    const known = new Set(rows.map((r) => r.id))
    const ordered = [...new Set(ids.filter((id) => known.has(id)))]
    const rest = rows.map((r) => r.id).filter((id) => !ordered.includes(id))
    await db.transaction(async (trx) => {
      for (const [index, id] of [...ordered, ...rest].entries()) {
        await trx
          .from(model.table)
          .where('id', id)
          .update({ position: index + 1 })
      }
    })
  },

  async usage(model: ListModel, userId: number, id: number) {
    const fk = model === Extension ? 'extension_id' : 'rarity_id'
    const cards = await db
      .from('cards')
      .where('user_id', userId)
      .where(fk, id)
      .count('* as total')
      .first()
    const openings =
      model === Extension
        ? await db
            .from('openings')
            .where('user_id', userId)
            .where('extension_id', id)
            .count('* as total')
            .first()
        : { total: 0 }
    return { cards: Number(cards?.total ?? 0), openings: Number(openings?.total ?? 0) }
  },
}
