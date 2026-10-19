import type { ProductType } from '~/types'

export const CONDITIONS: [code: string, label: string, tone: 1 | 2 | 3 | 4][] = [
  ['MT', 'Mint', 1],
  ['NM', 'Near Mint', 1],
  ['EX', 'Excellent', 2],
  ['GD', 'Good', 2],
  ['LP', 'Light Played', 3],
  ['PL', 'Played', 3],
  ['PO', 'Poor', 4],
]
export const LANGUAGES = ['FR', 'EN', 'JP', 'DE', 'IT', 'ES', 'PT', 'KO', 'ZH']
export const FINISHES = ['Normale', 'Holo', 'Reverse', 'Foil', 'Alt Art', 'Full Art', 'Gradée']

export const PRODUCT_TYPES: { value: ProductType; label: string; plural: string }[] = [
  { value: 'booster', label: 'Booster', plural: 'Boosters' },
  { value: 'display', label: 'Display', plural: 'Displays' },
  { value: 'starter_deck', label: 'Starter deck', plural: 'Starter decks' },
]
export const productLabel = (t: string, n = 1) => {
  const p = PRODUCT_TYPES.find((x) => x.value === t)
  return p ? (n > 1 ? p.plural : p.label) : t
}

export const conditionInfo = (code: string) => CONDITIONS.find((c) => c[0] === code) ?? CONDITIONS[1]!

const eurFmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const intFmt = new Intl.NumberFormat('fr-FR')
export const eur = (n: number | null | undefined) => (n === null || n === undefined ? '—' : eurFmt.format(n))
export const int = (n: number) => intFmt.format(n)
export const plural = (n: number, one: string, many = one + 's') => `${int(n)} ${n > 1 ? many : one}`

export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const dateFr = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
export const monthFr = (ym: string) =>
  new Date(ym + '-15T12:00:00').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
