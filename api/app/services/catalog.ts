/**
 * Fixed reference values shared by the API and its validators.
 */

export const CONDITIONS = ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO'] as const
export const LANGUAGES = ['FR', 'EN', 'JP', 'DE', 'IT', 'ES', 'PT', 'KO', 'ZH'] as const
export const FINISHES = [
  'Normale',
  'Holo',
  'Reverse',
  'Foil',
  'Alt Art',
  'Full Art',
  'Gradée',
] as const
export const PRODUCT_TYPES = ['booster', 'display', 'starter_deck'] as const

export type ProductType = (typeof PRODUCT_TYPES)[number]

/**
 * Rarities given to every new account, per game slug. Users can then
 * rename, reorder or delete them from the lists page.
 */
export const DEFAULT_RARITIES: Record<string, string[]> = {
  onepiece: ['C', 'UC', 'R', 'SR', 'SEC', 'L', 'SP', 'TR', 'P'],
  pokemon: [
    'Commune',
    'Peu commune',
    'Rare',
    'Holo Rare',
    'Double Rare',
    'Ultra Rare',
    'Illustration Rare',
    'Illustration Spéciale Rare',
    'Hyper Rare',
    'ACE SPEC',
    'Promo',
  ],
  wankul: ['Commune', 'Peu commune', 'Rare', 'Épique', 'Légendaire', 'Spéciale'],
  riftbound: ['Common', 'Uncommon', 'Rare', 'Epic', 'Showcase', 'Promo'],
}
