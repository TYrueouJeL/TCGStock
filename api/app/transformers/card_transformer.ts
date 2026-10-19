import type Card from '#models/card'
import { BaseTransformer } from '@adonisjs/core/transformers'
import { toMoney } from '#services/money'

export default class CardTransformer extends BaseTransformer<Card> {
  toObject() {
    const card = this.resource
    return {
      ...this.pick(card, [
        'id',
        'gameId',
        'extensionId',
        'rarityId',
        'name',
        'number',
        'language',
        'condition',
        'finish',
        'quantity',
        'location',
        'notes',
        'createdAt',
        'updatedAt',
      ]),
      purchasePrice: toMoney(card.purchasePrice),
      value: toMoney(card.value),
      extensionName: card.extension?.name ?? null,
      rarityName: card.rarity?.name ?? null,
    }
  }
}
