import { CardSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Game from '#models/game'
import Extension from '#models/extension'
import Rarity from '#models/rarity'

export default class Card extends CardSchema {
  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>

  @belongsTo(() => Extension)
  declare extension: BelongsTo<typeof Extension>

  @belongsTo(() => Rarity)
  declare rarity: BelongsTo<typeof Rarity>
}
