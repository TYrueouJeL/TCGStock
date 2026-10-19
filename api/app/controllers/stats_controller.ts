import { buildStats } from '#services/stats'
import { statsFilterValidator } from '#validators/opening'
import type { HttpContext } from '@adonisjs/core/http'

export default class StatsController {
  async show({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const filters = await statsFilterValidator.validate(request.qs())
    return serialize(await buildStats(user.id, filters))
  }
}
