import Game from '#models/game'
import GameTransformer from '#transformers/game_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class GamesController {
  async index({ serialize }: HttpContext) {
    const games = await Game.query().orderBy('position')
    return serialize(GameTransformer.transform(games))
  }
}
