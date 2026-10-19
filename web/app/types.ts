export type Game = { id: number; slug: string; name: string; color: string; position: number }

export type ListValue = {
  id: number
  gameId: number
  name: string
  code?: string | null
  position: number
  cardCount: number
  openingCount: number
}

export type Card = {
  id: number
  gameId: number
  extensionId: number
  rarityId: number
  extensionName: string | null
  rarityName: string | null
  name: string
  number: string
  language: string
  condition: string
  finish: string
  quantity: number
  purchasePrice: number | null
  value: number | null
  location: string
  notes: string | null
  createdAt: string
}

export type ProductType = 'booster' | 'display' | 'starter_deck'

export type Opening = {
  id: number
  gameId: number
  extensionId: number
  extensionName: string | null
  productType: ProductType
  quantity: number
  unitPrice: number | null
  pulledValue: number | null
  openedOn: string
  notes: string | null
}

export type User = { id: number; email: string; fullName: string | null; initials: string }

type ByType = Record<ProductType, number>

export type Stats = {
  stock: {
    byGame: { gameId: number; references: number; cards: number; value: number; spent: number }[]
    totals: { references: number; cards: number; value: number; spent: number }
  }
  openings: {
    totals: { sessions: number; items: ByType; spent: number; pulled: number; balance: number }
    byType: { type: ProductType; items: number; spent: number; pulled: number; averagePrice: number | null }[]
    byGame: { gameId: number; items: ByType; spent: number; pulled: number }[]
    byExtension: { extensionId: number; gameId: number; name: string; items: ByType; total: number; spent: number; pulled: number }[]
    byMonth: { month: string; items: ByType; spent: number }[]
  }
}
