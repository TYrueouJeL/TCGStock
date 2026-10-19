import Game from '#models/game'
import Rarity from '#models/rarity'
import type User from '#models/user'
import { DEFAULT_RARITIES } from '#services/catalog'

/**
 * Gives a new account the usual rarities of each game, so the add-card
 * form is usable straight away. Extensions start empty.
 */
export async function seedDefaultLists(user: User) {
  const games = await Game.all()
  const rows = games.flatMap((game) =>
    (DEFAULT_RARITIES[game.slug] ?? []).map((name, index) => ({
      userId: user.id,
      gameId: game.id,
      name,
      position: index + 1,
    }))
  )
  if (rows.length) await Rarity.createMany(rows)
}
