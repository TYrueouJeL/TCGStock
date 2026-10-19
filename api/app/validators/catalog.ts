import vine from '@vinejs/vine'

const name = (max: number) => vine.string().trim().minLength(1).maxLength(max)

export const createExtensionValidator = vine.create({
  name: name(120),
  code: vine.string().trim().maxLength(32).nullable().optional(),
})

export const updateExtensionValidator = vine.create({
  name: name(120).optional(),
  code: vine.string().trim().maxLength(32).nullable().optional(),
})

export const createRarityValidator = vine.create({
  name: name(80),
})

export const updateRarityValidator = vine.create({
  name: name(80).optional(),
})

export const reorderValidator = vine.create({
  ids: vine.array(vine.number().withoutDecimals().positive()).minLength(1),
})
