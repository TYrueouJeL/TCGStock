/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
  }
  games: {
    index: typeof routes['games.index']
  }
  extensions: {
    index: typeof routes['extensions.index']
    store: typeof routes['extensions.store']
    reorder: typeof routes['extensions.reorder']
    update: typeof routes['extensions.update']
    destroy: typeof routes['extensions.destroy']
  }
  rarities: {
    index: typeof routes['rarities.index']
    store: typeof routes['rarities.store']
    reorder: typeof routes['rarities.reorder']
    update: typeof routes['rarities.update']
    destroy: typeof routes['rarities.destroy']
  }
  cards: {
    index: typeof routes['cards.index']
    store: typeof routes['cards.store']
    import: typeof routes['cards.import']
    update: typeof routes['cards.update']
    quantity: typeof routes['cards.quantity']
    destroy: typeof routes['cards.destroy']
  }
  openings: {
    index: typeof routes['openings.index']
    store: typeof routes['openings.store']
    update: typeof routes['openings.update']
    destroy: typeof routes['openings.destroy']
  }
  stats: {
    show: typeof routes['stats.show']
  }
}
