import Extension from '#models/extension'
import { assertGame } from '#services/ownership'
import { listValues } from '#services/list_values'
import {
  createExtensionValidator,
  reorderValidator,
  updateExtensionValidator,
} from '#validators/catalog'
import type { HttpContext } from '@adonisjs/core/http'

const duplicate = (name: string) => ({
  errors: [{ field: 'name', rule: 'unique', message: `« ${name} » existe déjà pour ce jeu.` }],
})

export default class ExtensionsController {
  async index({ auth, params }: HttpContext) {
    const user = auth.getUserOrFail()
    const game = await assertGame(Number(params.gameId))
    return { data: await listValues.index(Extension, user.id, game.id) }
  }

  async store({ auth, params, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const game = await assertGame(Number(params.gameId))
    const { name, code } = await request.validateUsing(createExtensionValidator)
    if (await listValues.nameTaken(Extension, user.id, game.id, name))
      return response.conflict(duplicate(name))
    const ext = await Extension.create({
      userId: user.id,
      gameId: game.id,
      name,
      code: code || null,
      position: await listValues.nextPosition(Extension, user.id, game.id),
    })
    response.status(201)
    return serialize({
      id: ext.id,
      gameId: ext.gameId,
      name: ext.name,
      code: ext.code,
      position: ext.position,
      cardCount: 0,
      openingCount: 0,
    })
  }

  async update({ auth, params, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const ext = await Extension.query().where({ id: params.id, userId: user.id }).firstOrFail()
    const { name, code } = await request.validateUsing(updateExtensionValidator)
    if (name !== undefined) {
      if (await listValues.nameTaken(Extension, user.id, ext.gameId, name, ext.id))
        return response.conflict(duplicate(name))
      ext.name = name
    }
    if (code !== undefined) ext.code = code || null
    await ext.save()
    return serialize({
      id: ext.id,
      gameId: ext.gameId,
      name: ext.name,
      code: ext.code,
      position: ext.position,
    })
  }

  async reorder({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const game = await assertGame(Number(params.gameId))
    const { ids } = await request.validateUsing(reorderValidator)
    await listValues.reorder(Extension, user.id, game.id, ids)
    return response.noContent()
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const ext = await Extension.query().where({ id: params.id, userId: user.id }).firstOrFail()
    const used = await listValues.usage(Extension, user.id, ext.id)
    if (used.cards || used.openings) {
      return response.conflict({
        errors: [
          {
            message: `Cette extension est utilisée par ${used.cards} carte(s) et ${used.openings} ouverture(s). Modifie-les d’abord.`,
          },
        ],
      })
    }
    await ext.delete()
    return response.noContent()
  }
}
