import Extension from '#models/extension'
import Game from '#models/game'
import Rarity from '#models/rarity'
import { Exception } from '@adonisjs/core/exceptions'

/**
 * Raised when a payload points to a list value that is missing, belongs to
 * another user or to another game.
 */
export class InvalidReferenceException extends Exception {
  static status = 422
  static code = 'E_INVALID_REFERENCE'

  constructor(
    public field: string,
    message: string
  ) {
    super(message)
  }

  async handle(error: this, ctx: { response: any }) {
    ctx.response
      .status(error.status)
      .send({ errors: [{ field: error.field, message: error.message, rule: 'exists' }] })
  }
}

export async function assertGame(gameId: number) {
  const game = await Game.find(gameId)
  if (!game) throw new InvalidReferenceException('gameId', 'Ce jeu n’existe pas.')
  return game
}

export async function assertExtension(userId: number, gameId: number, extensionId: number) {
  const ext = await Extension.query().where({ id: extensionId, userId, gameId }).first()
  if (!ext) throw new InvalidReferenceException('extensionId', 'Choisis une extension de ce jeu.')
  return ext
}

export async function assertRarity(userId: number, gameId: number, rarityId: number) {
  const rarity = await Rarity.query().where({ id: rarityId, userId, gameId }).first()
  if (!rarity) throw new InvalidReferenceException('rarityId', 'Choisis une rareté de ce jeu.')
  return rarity
}
