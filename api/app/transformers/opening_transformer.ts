import type Opening from '#models/opening'
import { BaseTransformer } from '@adonisjs/core/transformers'
import { toMoney } from '#services/money'

export default class OpeningTransformer extends BaseTransformer<Opening> {
  toObject() {
    const o = this.resource
    return {
      ...this.pick(o, [
        'id',
        'gameId',
        'extensionId',
        'productType',
        'quantity',
        'notes',
        'createdAt',
      ]),
      openedOn: o.openedOn.toISODate(),
      unitPrice: toMoney(o.unitPrice),
      pulledValue: toMoney(o.pulledValue),
      extensionName: o.extension?.name ?? null,
    }
  }
}
