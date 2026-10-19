import vine from '@vinejs/vine'
import { CONDITIONS, FINISHES, LANGUAGES } from '#services/catalog'

const price = () => vine.number().min(0).max(1_000_000).decimal([0, 2]).nullable().optional()

/**
 * Every field is required except notes, purchase price and value.
 */
const cardFields = {
  gameId: vine.number().withoutDecimals().positive(),
  extensionId: vine.number().withoutDecimals().positive(),
  rarityId: vine.number().withoutDecimals().positive(),
  name: vine.string().trim().minLength(1).maxLength(160),
  number: vine.string().trim().minLength(1).maxLength(40),
  language: vine.enum(LANGUAGES),
  condition: vine.enum(CONDITIONS),
  finish: vine.enum(FINISHES),
  quantity: vine.number().withoutDecimals().min(0).max(100_000),
  purchasePrice: price(),
  value: price(),
  location: vine.string().trim().minLength(1).maxLength(160),
  notes: vine.string().trim().maxLength(2000).nullable().optional(),
}

export const cardValidator = vine.create(cardFields)

export const quantityValidator = vine.create({
  delta: vine.number().withoutDecimals().min(-1000).max(1000),
})

/**
 * Import rows reference extensions and rarities by name: missing ones are
 * created in the game's lists. Only the card name is strictly required here,
 * because spreadsheets rarely have every column.
 */
export const importValidator = vine.create({
  rows: vine
    .array(
      vine.object({
        game: vine.string().trim().minLength(1),
        name: vine.string().trim().minLength(1).maxLength(160),
        extension: vine.string().trim().maxLength(120).optional(),
        rarity: vine.string().trim().maxLength(80).optional(),
        number: vine.string().trim().maxLength(40).optional(),
        language: vine.string().trim().maxLength(8).optional(),
        condition: vine.string().trim().maxLength(20).optional(),
        finish: vine.string().trim().maxLength(32).optional(),
        quantity: vine.number().withoutDecimals().min(0).optional(),
        purchasePrice: vine.number().min(0).nullable().optional(),
        value: vine.number().min(0).nullable().optional(),
        location: vine.string().trim().maxLength(160).optional(),
        notes: vine.string().trim().maxLength(2000).nullable().optional(),
      })
    )
    .minLength(1)
    .maxLength(5000),
})
