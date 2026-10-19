import { CONDITIONS, FINISHES, LANGUAGES } from '#services/catalog'

const norm = (s: string | undefined | null) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')

/** Accepts "One Piece", "onepiece", "Pokémon", "pokemon"… */
export function gameSlugOf(value: string): string | null {
  const n = norm(value)
  if (n.includes('piece') || n === 'op') return 'onepiece'
  if (n.includes('poke')) return 'pokemon'
  if (n.includes('wank')) return 'wankul'
  if (n.includes('rift')) return 'riftbound'
  return null
}

const CONDITION_NAMES: Record<string, string> = {
  mint: 'MT',
  nearmint: 'NM',
  excellent: 'EX',
  good: 'GD',
  lightplayed: 'LP',
  played: 'PL',
  poor: 'PO',
}

export function conditionOf(value: string | undefined): string {
  const n = norm(value)
  const code = CONDITIONS.find((c) => norm(c) === n)
  if (code) return code
  return CONDITION_NAMES[n] ?? 'NM'
}

export function languageOf(value: string | undefined): string {
  const code = String(value ?? '')
    .trim()
    .toUpperCase()
    .slice(0, 2)
  return (LANGUAGES as readonly string[]).includes(code) ? code : 'FR'
}

export function finishOf(value: string | undefined): string {
  const hit = FINISHES.find((f) => norm(f) === norm(value))
  return hit ?? 'Normale'
}
