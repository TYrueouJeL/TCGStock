import Rarity from '#models/rarity'
import { assertGame } from '#services/ownership'
import { listValues } from '#services/list_values'
import { createRarityValidator, reorderValidator, updateRarityValidator } from '#validators/catalog'
import type { HttpContext } from '@adonisjs/core/http'

const duplicate = (name: string) => ({
  errors: [{ field: 'name', rule: 'unique', message: `« ${name} » existe déjà pour ce jeu.` }],
})

export default class RaritiesController {
  async index({ auth, params }: HttpContext) {
    const user = auth.getUserOrFail()
    const game = await assertGame(Number(params.gameId))
    return { data: await listValues.index(Rarity, user.id, game.id) }
  }

  async store({ auth, params, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const game = await assertGame(Number(params.gameId))
    const { name } = await request.validateUsing(createRarityValidator)
    if (await listValues.nameTaken(Rarity, user.id, game.id, name))
      return response.conflict(duplicate(name))
    const rarity = await Rarity.create({
      userId: user.id,
      gameId: game.id,
      name,
      position: await listValues.nextPosition(Rarity, user.id, game.id),
    })
    response.status(201)
    return serialize({
      id: rarity.id,
      gameId: rarity.gameId,
      name: rarity.name,
      position: rarity.position,
      cardCount: 0,
      openingCount: 0,
    })
  }

  async update({ auth, params, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const rarity = await Rarity.query().where({ id: params.id, userId: user.id }).firstOrFail()
    const { name } = await request.validateUsing(updateRarityValidator)
    if (name !== undefined) {
      if (await listValues.nameTaken(Rarity, user.id, rarity.gameId, name, rarity.id))
        return response.conflict(duplicate(name))
      rarity.name = name
    }
    await rarity.save()
    return serialize({
      id: rarity.id,
      gameId: rarity.gameId,
      name: rarity.name,
      position: rarity.position,
    })
  }

  async reorder({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const game = await assertGame(Number(params.gameId))
    const { ids } = await request.validateUsing(reorderValidator)
    await listValues.reorder(Rarity, user.id, game.id, ids)
    return response.noContent()
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const rarity = await Rarity.query().where({ id: params.id, userId: user.id }).firstOrFail()
    const used = await listValues.usage(Rarity, user.id, rarity.id)
    if (used.cards) {
      return response.conflict({
        errors: [
          { message: `Cette rareté est utilisée par ${used.cards} carte(s). Modifie-les d’abord.` },
        ],
      })
    }
    await rarity.delete()
    return response.noContent()
  }
}
