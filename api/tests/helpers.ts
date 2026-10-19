import User from '#models/user'
import Game from '#models/game'
import Extension from '#models/extension'
import Rarity from '#models/rarity'
import { seedDefaultLists } from '#services/account_setup'

let counter = 0

/** A user with the default rarities, like after signing up. */
export async function makeUser() {
  counter++
  const user = await User.create({
    email: `user${counter}-${Date.now()}@test.dev`,
    password: 'secret-password',
    fullName: 'Test',
  })
  await seedDefaultLists(user)
  return user
}

export async function game(slug: string) {
  return Game.findByOrFail('slug', slug)
}

export async function makeExtension(user: User, slug: string, name = 'Romance Dawn') {
  const g = await game(slug)
  return Extension.create({ userId: user.id, gameId: g.id, name, position: 1 })
}

export async function firstRarity(user: User, slug: string) {
  const g = await game(slug)
  return Rarity.query().where({ userId: user.id, gameId: g.id }).orderBy('position').firstOrFail()
}

/** Awaits a request and checks its status code. */
export async function expectStatus(request: PromiseLike<any>, code: number) {
  const response = await request
  if (response.status() !== code) {
    throw new Error(
      `Expected ${code}, got ${response.status()}: ${JSON.stringify(response.body())}`
    )
  }
  return response
}
