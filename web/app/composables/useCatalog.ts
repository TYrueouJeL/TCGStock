import type { Game, ListValue } from '~/types'

type Lists = { extensions: ListValue[]; rarities: ListValue[] }

/** Games and their per-user lists (extensions, rarities), cached in state. */
export function useCatalog() {
  const api = useApi()
  const games = useState<Game[]>('games', () => [])
  const lists = useState<Record<number, Lists>>('lists', () => ({}))

  async function loadGames() {
    if (!games.value.length) games.value = (await api<{ data: Game[] }>('/games')).data
    return games.value
  }

  async function loadLists(gameId: number, force = false) {
    if (!force && lists.value[gameId]) return lists.value[gameId]
    const [extensions, rarities] = await Promise.all([
      api<{ data: ListValue[] }>(`/games/${gameId}/extensions`),
      api<{ data: ListValue[] }>(`/games/${gameId}/rarities`),
    ])
    lists.value = { ...lists.value, [gameId]: { extensions: extensions.data, rarities: rarities.data } }
    return lists.value[gameId]!
  }

  const gameById = (id: number) => games.value.find((g) => g.id === id)

  return { games, lists, loadGames, loadLists, gameById }
}
