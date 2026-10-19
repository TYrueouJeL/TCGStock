import vine from '@vinejs/vine'
import { PRODUCT_TYPES } from '#services/catalog'

const price = () => vine.number().min(0).max(1_000_000).decimal([0, 2]).nullable().optional()

export const openingValidator = vine.create({
  gameId: vine.number().withoutDecimals().positive(),
  extensionId: vine.number().withoutDecimals().positive(),
  productType: vine.enum(PRODUCT_TYPES),
  quantity: vine.number().withoutDecimals().min(1).max(10_000),
  unitPrice: price(),
  pulledValue: price(),
  openedOn: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: vine.string().trim().maxLength(2000).nullable().optional(),
})

export const statsFilterValidator = vine.create({
  gameId: vine.number().withoutDecimals().positive().optional(),
  from: vine
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: vine
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})
