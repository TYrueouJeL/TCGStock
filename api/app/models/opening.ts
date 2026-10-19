import { OpeningSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Game from '#models/game'
import Extension from '#models/extension'

export default class Opening extends OpeningSchema {
  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>

  @belongsTo(() => Extension)
  declare extension: BelongsTo<typeof Extension>
}
