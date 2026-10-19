import { RaritySchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Game from '#models/game'

export default class Rarity extends RaritySchema {
  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>
}
