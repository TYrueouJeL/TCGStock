import Opening from '#models/opening'
import OpeningTransformer from '#transformers/opening_transformer'
import { assertExtension, assertGame } from '#services/ownership'
import { openingValidator } from '#validators/opening'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class OpeningsController {
  async index({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { gameId, productType, extensionId } = request.qs()
    const query = Opening.query()
      .where('user_id', user.id)
      .preload('extension')
      .orderBy('opened_on', 'desc')
      .orderBy('id', 'desc')
    if (gameId) query.where('game_id', Number(gameId))
    if (extensionId) query.where('extension_id', Number(extensionId))
    if (productType) query.where('product_type', String(productType))
    return serialize(OpeningTransformer.transform(await query.limit(10_000)))
  }

  async store({ auth, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(openingValidator)
    await assertGame(data.gameId)
    await assertExtension(user.id, data.gameId, data.extensionId)
    const opening = await Opening.create({ ...this.fields(data), userId: user.id })
    await opening.load('extension')
    response.status(201)
    return serialize(OpeningTransformer.transform(opening))
  }

  async update({ auth, params, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const opening = await Opening.query().where({ id: params.id, userId: user.id }).firstOrFail()
    const data = await request.validateUsing(openingValidator)
    await assertGame(data.gameId)
    await assertExtension(user.id, data.gameId, data.extensionId)
    opening.merge(this.fields(data))
    await opening.save()
    await opening.load('extension')
    return serialize(OpeningTransformer.transform(opening))
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const opening = await Opening.query().where({ id: params.id, userId: user.id }).firstOrFail()
    await opening.delete()
    return response.noContent()
  }

  private fields(data: Awaited<ReturnType<typeof openingValidator.validate>>) {
    return {
      gameId: data.gameId,
      extensionId: data.extensionId,
      productType: data.productType,
      quantity: data.quantity,
      unitPrice: data.unitPrice ?? null,
      pulledValue: data.pulledValue ?? null,
      openedOn: DateTime.fromISO(data.openedOn),
      notes: data.notes || null,
    }
  }
}
