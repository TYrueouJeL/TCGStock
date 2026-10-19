import type Game from '#models/game'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class GameTransformer extends BaseTransformer<Game> {
  toObject() {
    return this.pick(this.resource, ['id', 'slug', 'name', 'color', 'position'])
  }
}
