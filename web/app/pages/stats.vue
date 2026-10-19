<script setup lang="ts">
import type { Stats } from '~/types'

useHead({ title: 'Statistiques · Classeur TCG' })

const api = useApi()
const { games, loadGames, gameById } = useCatalog()
const stats = ref<Stats | null>(null)
const error = ref('')
const gameId = ref<number | null>(null)
const period = ref<'all' | '12m' | 'year' | 'lastyear'>('all')

const range = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  if (period.value === '12m') return { from: iso(new Date(y, now.getMonth() - 11, 1)), to: todayISO() }
  if (period.value === 'year') return { from: `${y}-01-01`, to: `${y}-12-31` }
  if (period.value === 'lastyear') return { from: `${y - 1}-01-01`, to: `${y - 1}-12-31` }
  return {}
})

async function load() {
  error.value = ''
  try {
    await loadGames()
    const query: Record<string, string | number> = { ...(range.value as Record<string, string>) }
    if (gameId.value) query.gameId = gameId.value
    stats.value = (await api<{ data: Stats }>('/stats', { query })).data
  } catch (e) {
    error.value = apiProblem(e).message
  }
}
onMounted(load)
watch([gameId, period], load)

const o = computed(() => stats.value?.openings)

/** Every month between the first and last one, so gaps show as empty columns. */
const months = computed(() => {
  const list = o.value?.byMonth ?? []
  const r = range.value as { from?: string; to?: string }
  const first = r.from?.slice(0, 7) ?? list[0]?.month
  const last = r.to && r.to <= todayISO() ? r.to.slice(0, 7) : (period.value === 'all' ? list.at(-1)?.month : todayISO().slice(0, 7))
  if (!first || !last) return []
  const byKey = new Map(list.map((m) => [m.month, m]))
  const out = []
  let [yy, mm] = first.split('-').map(Number) as [number, number]
  for (let guard = 0; guard < 240; guard++) {
    const key = `${yy}-${String(mm).padStart(2, '0')}`
    out.push(byKey.get(key) ?? { month: key, items: { booster: 0, display: 0, starter_deck: 0 }, spent: 0 })
    if (key >= last) break
    mm++
    if (mm > 12) { mm = 1; yy++ }
  }
  return out
})

const hasOpenings = computed(() => (o.value?.totals.sessions ?? 0) > 0)
const extRows = computed(() =>
  (o.value?.byExtension ?? []).slice(0, 10).map((e) => ({
    key: e.extensionId,
    label: e.name,
    color: gameById(e.gameId)?.color,
    segs: PRODUCT_TYPES.map((p) => ({ value: e.items[p.value], color: `var(--${p.value})`, label: p.plural })),
    display: int(e.total),
  }))
)
const stockRows = computed(() =>
  (stats.value?.stock.byGame ?? [])
    .map((g) => ({ g, game: gameById(g.gameId) }))
    .sort((a, b) => (a.game?.position ?? 0) - (b.game?.position ?? 0))
    .map(({ g, game }) => ({
      key: g.gameId,
      label: game?.name ?? '',
      color: game?.color,
      segs: [{ value: g.value, color: game?.color ?? 'var(--accent)', label: 'Valeur' }],
      display: `${eur(g.value)} · ${plural(g.cards, 'carte')}`,
    }))
)
</script>

<template>
  <div class="page-head">
    <div>
      <h1>Statistiques</h1>
      <p>Ce que tu ouvres, ce que ça te coûte et ce que vaut ton stock.</p>
    </div>
    <NuxtLink class="btn primary" to="/ouvertures">+ Noter une ouverture</NuxtLink>
  </div>

  <div class="toolbar">
    <GamePicker v-if="games.length" v-model="gameId" allow-all />
    <select id="period" v-model="period" class="field auto" aria-label="Période">
      <option value="all">Depuis le début</option>
      <option value="12m">12 derniers mois</option>
      <option value="year">Cette année</option>
      <option value="lastyear">L’année dernière</option>
    </select>
  </div>

  <p v-if="error" class="notice warn">{{ error }} <button class="linkbtn" type="button" @click="load">Réessayer</button></p>

  <template v-if="stats && o">
    <section class="kpis" aria-label="Ouvertures">
      <div v-for="t in o.byType" :key="t.type" class="kpi">
        <span class="ptype" :class="'pt-' + t.type">{{ productLabel(t.type, 2) }} ouverts</span>
        <span class="v">{{ int(t.items) }}</span>
        <span class="s">{{ t.averagePrice !== null ? `${eur(t.averagePrice)} en moyenne` : 'prix non renseigné' }}</span>
      </div>
      <div class="kpi">
        <span class="label">Dépensé</span>
        <span class="v">{{ eur(o.totals.spent) }}</span>
        <span class="s">{{ plural(o.totals.sessions, 'ouverture notée', 'ouvertures notées') }}</span>
      </div>
      <div class="kpi">
        <span class="label">Valeur tirée</span>
        <span class="v">{{ eur(o.totals.pulled) }}</span>
        <span class="s" :style="{ color: o.totals.balance >= 0 ? 'var(--ok)' : 'var(--danger)' }">
          Bilan {{ o.totals.balance >= 0 ? '+' : '−' }}{{ eur(Math.abs(o.totals.balance)) }}
        </span>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head"><h2>Produits ouverts par mois</h2><span class="hint">en nombre de produits</span></div>
      <MonthChart v-if="hasOpenings && months.length" :months="months" />
      <div v-else class="empty"><p>Aucune ouverture sur cette période. <NuxtLink to="/ouvertures">Note ta première ouverture</NuxtLink> pour voir le graphique.</p></div>
    </section>

    <div class="two">
      <section class="panel">
        <h2>Par jeu</h2>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Jeu</th><th class="num">Boosters</th><th class="num">Displays</th><th class="num">Decks</th><th class="num">Dépensé</th><th class="num">Tiré</th></tr></thead>
            <tbody>
              <tr v-for="g in o.byGame" :key="g.gameId">
                <td style="white-space: nowrap"><span class="dot" :style="{ '--c': gameById(g.gameId)?.color }" /> {{ gameById(g.gameId)?.name }}</td>
                <td class="num">{{ int(g.items.booster) }}</td>
                <td class="num">{{ int(g.items.display) }}</td>
                <td class="num">{{ int(g.items.starter_deck) }}</td>
                <td class="num">{{ eur(g.spent) }}</td>
                <td class="num">{{ eur(g.pulled) }}</td>
              </tr>
              <tr v-if="!o.byGame.length"><td colspan="6" class="muted">Aucune ouverture.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <h2>Par produit</h2>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Produit</th><th class="num">Ouverts</th><th class="num">Dépensé</th><th class="num">Prix moyen</th><th class="num">Tiré</th></tr></thead>
            <tbody>
              <tr v-for="t in o.byType" :key="t.type">
                <td><span class="ptype" :class="'pt-' + t.type">{{ productLabel(t.type, 2) }}</span></td>
                <td class="num">{{ int(t.items) }}</td>
                <td class="num">{{ eur(t.spent) }}</td>
                <td class="num">{{ eur(t.averagePrice) }}</td>
                <td class="num">{{ eur(t.pulled) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div class="two">
      <section class="panel">
        <div class="panel-head"><h2>Extensions les plus ouvertes</h2><span class="hint">top 10, en produits</span></div>
        <HBars v-if="extRows.length" :rows="extRows" />
        <p v-else class="muted">Aucune ouverture.</p>
        <div v-if="extRows.length" class="legend">
          <span v-for="p in PRODUCT_TYPES" :key="p.value" class="ptype" :class="'pt-' + p.value">{{ p.plural }}</span>
        </div>
      </section>
      <section class="panel">
        <div class="panel-head">
          <h2>Valeur du stock</h2>
          <span class="hint">{{ eur(stats.stock.totals.value) }} · {{ plural(stats.stock.totals.cards, 'carte') }}</span>
        </div>
        <HBars v-if="stockRows.length" :rows="stockRows" />
        <p v-else class="muted">Pas encore de carte en stock.</p>
        <p v-if="stats.stock.totals.spent" class="hint">Payé pour ces cartes : {{ eur(stats.stock.totals.spent) }}</p>
      </section>
    </div>
  </template>
  <div v-else-if="!error" class="empty"><p>Chargement des statistiques…</p></div>
</template>

<style scoped>
.legend { display: flex; gap: 14px; flex-wrap: wrap; }
</style>
