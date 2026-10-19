import db from '@adonisjs/lucid/services/db'
import { PRODUCT_TYPES, type ProductType } from '#services/catalog'
import { toMoney } from '#services/money'

type Filters = { gameId?: number; from?: string; to?: string }

const money = (n: number) => toMoney(n) ?? 0
const emptyTypes = () =>
  Object.fromEntries(PRODUCT_TYPES.map((t) => [t, 0])) as Record<ProductType, number>

/**
 * Builds the numbers behind the stats page. Openings are aggregated in
 * JavaScript so the same code runs on SQLite and PostgreSQL.
 */
export async function buildStats(userId: number, filters: Filters) {
  // Stock, per game
  const stockRows = await db
    .from('cards')
    .where('user_id', userId)
    .if(filters.gameId, (q) => q.where('game_id', filters.gameId!))
    .groupBy('game_id')
    .select('game_id')
    .count('* as refs')
    .sum('quantity as cards')
    .select(db.raw('sum(coalesce(value, 0) * quantity) as value'))
    .select(db.raw('sum(coalesce(purchase_price, 0) * quantity) as spent'))

  const stockByGame = stockRows.map((r: any) => ({
    gameId: Number(r.game_id),
    references: Number(r.refs),
    cards: Number(r.cards ?? 0),
    value: money(Number(r.value ?? 0)),
    spent: money(Number(r.spent ?? 0)),
  }))

  // Openings
  const rows = await db
    .from('openings')
    .leftJoin('extensions', 'extensions.id', 'openings.extension_id')
    .where('openings.user_id', userId)
    .if(filters.gameId, (q) => q.where('openings.game_id', filters.gameId!))
    .if(filters.from, (q) => q.where('openings.opened_on', '>=', filters.from!))
    .if(filters.to, (q) => q.where('openings.opened_on', '<=', filters.to!))
    .select(
      'openings.game_id',
      'openings.extension_id',
      'openings.product_type',
      'openings.quantity',
      'openings.unit_price',
      'openings.pulled_value',
      'openings.opened_on',
      'extensions.name as extension_name'
    )

  const totals = { sessions: 0, items: emptyTypes(), spent: 0, pulled: 0, pricedSessions: 0 }
  const byType = new Map<
    ProductType,
    { items: number; spent: number; pricedItems: number; pulled: number }
  >()
  const byGame = new Map<
    number,
    { items: Record<ProductType, number>; spent: number; pulled: number }
  >()
  const byExtension = new Map<
    number,
    {
      gameId: number
      name: string
      items: Record<ProductType, number>
      spent: number
      pulled: number
    }
  >()
  const byMonth = new Map<string, { items: Record<ProductType, number>; spent: number }>()

  for (const r of rows as any[]) {
    const type = r.product_type as ProductType
    const qty = Number(r.quantity)
    const price = r.unit_price === null ? null : Number(r.unit_price)
    const spent = price === null ? 0 : price * qty
    const pulled = r.pulled_value === null ? 0 : Number(r.pulled_value)
    const date =
      r.opened_on instanceof Date
        ? r.opened_on.toISOString().slice(0, 10)
        : String(r.opened_on).slice(0, 10)
    const month = date.slice(0, 7)

    totals.sessions++
    totals.items[type] += qty
    totals.spent += spent
    totals.pulled += pulled

    const t = byType.get(type) ?? { items: 0, spent: 0, pricedItems: 0, pulled: 0 }
    t.items += qty
    t.spent += spent
    t.pricedItems += price === null ? 0 : qty
    t.pulled += pulled
    byType.set(type, t)

    const g = byGame.get(r.game_id) ?? { items: emptyTypes(), spent: 0, pulled: 0 }
    g.items[type] += qty
    g.spent += spent
    g.pulled += pulled
    byGame.set(r.game_id, g)

    const e = byExtension.get(r.extension_id) ?? {
      gameId: r.game_id,
      name: r.extension_name ?? '—',
      items: emptyTypes(),
      spent: 0,
      pulled: 0,
    }
    e.items[type] += qty
    e.spent += spent
    e.pulled += pulled
    byExtension.set(r.extension_id, e)

    const m = byMonth.get(month) ?? { items: emptyTypes(), spent: 0 }
    m.items[type] += qty
    m.spent += spent
    byMonth.set(month, m)
  }

  return {
    stock: {
      byGame: stockByGame,
      totals: {
        references: stockByGame.reduce((s, g) => s + g.references, 0),
        cards: stockByGame.reduce((s, g) => s + g.cards, 0),
        value: money(stockByGame.reduce((s, g) => s + g.value, 0)),
        spent: money(stockByGame.reduce((s, g) => s + g.spent, 0)),
      },
    },
    openings: {
      totals: {
        sessions: totals.sessions,
        items: totals.items,
        spent: money(totals.spent),
        pulled: money(totals.pulled),
        balance: money(totals.pulled - totals.spent),
      },
      byType: PRODUCT_TYPES.map((type) => {
        const t = byType.get(type) ?? { items: 0, spent: 0, pricedItems: 0, pulled: 0 }
        return {
          type,
          items: t.items,
          spent: money(t.spent),
          pulled: money(t.pulled),
          averagePrice: t.pricedItems ? money(t.spent / t.pricedItems) : null,
        }
      }),
      byGame: [...byGame.entries()].map(([gameId, g]) => ({
        gameId,
        items: g.items,
        spent: money(g.spent),
        pulled: money(g.pulled),
      })),
      byExtension: [...byExtension.entries()]
        .map(([extensionId, e]) => ({
          extensionId,
          gameId: e.gameId,
          name: e.name,
          items: e.items,
          total: Object.values(e.items).reduce((s, n) => s + n, 0),
          spent: money(e.spent),
          pulled: money(e.pulled),
        }))
        .sort((a, b) => b.total - a.total),
      byMonth: [...byMonth.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, m]) => ({ month, items: m.items, spent: money(m.spent) })),
    },
  }
}
