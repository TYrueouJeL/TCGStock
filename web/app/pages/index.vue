<script setup lang="ts">
import type { Card } from '~/types'

useHead({ title: 'Stock · Classeur TCG' })

const api = useApi()
const { toast } = useToast()
const { games, loadGames, gameById } = useCatalog()

const cards = ref<Card[]>([])
const loading = ref(true)
const loadError = ref('')
const filters = reactive({ gameId: null as number | null, q: '', condition: '', sort: 'recent' })

async function load() {
  loadError.value = ''
  try {
    await loadGames()
    cards.value = (await api<{ data: Card[] }>('/cards')).data
  } catch (e) {
    loadError.value = apiProblem(e).message
  } finally {
    loading.value = false
  }
}
onMounted(load)

const sum = (list: Card[], f: (c: Card) => number) => list.reduce((s, c) => s + f(c), 0)
const tiles = computed(() => {
  const make = (id: number | null, name: string, color: string, list: Card[]) => {
    const value = sum(list, (c) => c.quantity * (c.value ?? 0))
    const paid = sum(list, (c) => c.quantity * (c.purchasePrice ?? 0))
    return { id, name, color, refs: list.length, qty: sum(list, (c) => c.quantity), value, paid, diff: value - paid }
  }
  return [
    make(null, 'Tout le stock', 'var(--ink)', cards.value),
    ...games.value.map((g) => make(g.id, g.name, g.color, cards.value.filter((c) => c.gameId === g.id))),
  ]
})

const shown = computed(() => {
  const q = filters.q.trim().toLowerCase()
  let list = cards.value.filter((c) => (filters.gameId === null || c.gameId === filters.gameId) && (!filters.condition || c.condition === filters.condition))
  if (q) {
    list = list.filter((c) =>
      [c.name, c.extensionName, c.number, c.rarityName, c.location, c.notes, c.language, c.finish].join(' ').toLowerCase().includes(q)
    )
  }
  const sorts: Record<string, (a: Card, b: Card) => number> = {
    recent: (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
    name: (a, b) => a.name.localeCompare(b.name, 'fr'),
    value: (a, b) => (b.value ?? 0) * b.quantity - (a.value ?? 0) * a.quantity,
    qty: (a, b) => b.quantity - a.quantity,
    set: (a, b) => (a.extensionName ?? '').localeCompare(b.extensionName ?? '', 'fr') || a.number.localeCompare(b.number, 'fr', { numeric: true }),
  }
  return [...list].sort(sorts[filters.sort] ?? sorts.recent)
})
const shownTotals = computed(() => ({
  qty: sum(shown.value, (c) => c.quantity),
  value: sum(shown.value, (c) => c.quantity * (c.value ?? 0)),
  paid: sum(shown.value, (c) => c.quantity * (c.purchasePrice ?? 0)),
}))

function pickTile(id: number | null) {
  filters.gameId = filters.gameId === id && id !== null ? null : id
}

async function step(card: Card, delta: number) {
  if (card.quantity + delta < 0) return
  card.quantity += delta
  try {
    const res = await api<{ data: Card }>(`/cards/${card.id}/quantity`, { method: 'POST', body: { delta } })
    card.quantity = res.data.quantity
  } catch (e) {
    card.quantity -= delta
    toast(apiProblem(e).message)
  }
}

const dialogOpen = ref(false)
const editing = ref<Card | null>(null)
function openCard(card: Card | null) {
  editing.value = card
  dialogOpen.value = true
}
function onSaved(card: Card, created: boolean) {
  const i = cards.value.findIndex((c) => c.id === card.id)
  if (i >= 0) cards.value[i] = card
  else cards.value.unshift(card)
  toast(created ? 'Carte ajoutée' : 'Carte modifiée')
}
function onDeleted(id: number) {
  cards.value = cards.value.filter((c) => c.id !== id)
  toast('Carte supprimée')
}

const importOpen = ref(false)
const fallbackGame = computed(() => gameById(filters.gameId ?? 0)?.slug ?? 'pokemon')

function exportCsv() {
  const rows = cards.value.map((c) => [
    gameById(c.gameId)?.name, c.name, c.extensionName, c.number, c.rarityName, c.language, c.condition, c.finish, c.quantity,
    c.purchasePrice === null ? '' : String(c.purchasePrice).replace('.', ','),
    c.value === null ? '' : String(c.value).replace('.', ','),
    c.location, c.notes,
  ])
  const head = ['jeu', 'nom', 'extension', 'numero', 'rarete', 'langue', 'etat', 'finition', 'quantite', 'prix_achat', 'valeur', 'emplacement', 'notes']
  download(`stock-tcg-${todayISO()}.csv`, toCsv([head, ...rows]), 'text/csv;charset=utf-8')
}
function exportJson() {
  const cartes = cards.value.map((c) => ({
    game: gameById(c.gameId)?.slug, name: c.name, extension: c.extensionName, rarity: c.rarityName, number: c.number, language: c.language,
    condition: c.condition, finish: c.finish, quantity: c.quantity, purchasePrice: c.purchasePrice, value: c.value, location: c.location, notes: c.notes,
  }))
  download(`stock-tcg-${todayISO()}.json`, JSON.stringify({ app: 'Classeur TCG', exportedAt: new Date().toISOString(), cartes }, null, 2), 'application/json')
}
</script>

<template>
  <div class="page-head">
    <div>
      <h1>Stock</h1>
      <p>Tes cartes One Piece, Pokémon, Wankul et Riftbound, avec leur état et leur valeur.</p>
    </div>
    <div class="actions">
      <button class="btn" type="button" @click="importOpen = true">Importer</button>
      <button class="btn" type="button" :disabled="!cards.length" @click="exportCsv">Exporter en CSV</button>
      <button class="btn" type="button" :disabled="!cards.length" @click="exportJson">JSON</button>
      <button class="btn primary" type="button" @click="openCard(null)">+ Ajouter une carte</button>
    </div>
  </div>

  <p v-if="loadError" class="notice warn">{{ loadError }} <button class="linkbtn" type="button" @click="load">Réessayer</button></p>

  <section class="games" aria-label="Synthèse par jeu">
    <button
      v-for="t in tiles"
      :key="t.id ?? 'all'"
      type="button"
      class="game"
      :class="{ all: t.id === null }"
      :style="{ '--c': t.color }"
      :aria-pressed="filters.gameId === t.id"
      @click="pickTile(t.id)"
    >
      <span class="gname"><span class="dot" />{{ t.name }}</span>
      <span class="big">{{ eur(t.value) }}</span>
      <span class="sub">
        <span>{{ plural(t.qty, 'carte') }} · {{ t.refs }} réf.</span>
        <span v-if="t.paid > 0" class="num" :style="{ color: t.diff >= 0 ? 'var(--ok)' : 'var(--danger)' }">{{ t.diff >= 0 ? '+' : '−' }}{{ eur(Math.abs(t.diff)) }}</span>
      </span>
    </button>
  </section>

  <section class="toolbar" aria-label="Filtres">
    <input id="q" v-model="filters.q" class="field search" type="search" placeholder="Rechercher un nom, une extension, un numéro, un emplacement…" autocomplete="off" />
    <select id="f-cond" v-model="filters.condition" class="field auto" aria-label="Filtrer par état">
      <option value="">Tous les états</option>
      <option v-for="c in CONDITIONS" :key="c[0]" :value="c[0]">{{ c[0] }} · {{ c[1] }}</option>
    </select>
    <select id="f-sort" v-model="filters.sort" class="field auto" aria-label="Trier">
      <option value="recent">Ajout récent</option>
      <option value="name">Nom (A→Z)</option>
      <option value="value">Valeur totale ↓</option>
      <option value="qty">Quantité ↓</option>
      <option value="set">Extension / numéro</option>
    </select>
    <span class="count">{{ cards.length ? plural(shown.length, 'référence affichée', 'références affichées') : '' }}</span>
  </section>

  <section class="list" aria-live="polite">
    <div v-if="loading" class="empty"><p>Chargement du stock…</p></div>
    <div v-else-if="!cards.length" class="empty">
      <h2>Ton classeur est vide</h2>
      <p>Commence par créer les extensions de tes jeux, puis ajoute ta première carte. Tu peux aussi importer un fichier CSV.</p>
      <div class="actions">
        <NuxtLink class="btn" to="/listes">Gérer les extensions</NuxtLink>
        <button class="btn primary" type="button" @click="openCard(null)">+ Ajouter une carte</button>
        <button class="btn" type="button" @click="importOpen = true">Importer un fichier</button>
      </div>
    </div>
    <div v-else-if="!shown.length" class="empty">
      <p>Aucune carte ne correspond à ces filtres.</p>
      <button class="btn" type="button" @click="Object.assign(filters, { gameId: null, q: '', condition: '' })">Effacer les filtres</button>
    </div>
    <template v-else>
      <div class="row head" role="row">
        <span /><span class="label">Carte</span><span class="label c-set">Détails</span><span class="label">État</span><span class="label">Quantité</span>
        <span class="label right c-unit">Unité</span><span class="label right">Total</span><span />
      </div>
      <div v-for="c in shown" :key="c.id" class="row" :style="{ '--c': gameById(c.gameId)?.color }">
        <span class="bar" />
        <div class="c-name">
          <div class="cname">{{ c.name }}</div>
          <div class="cmeta">
            {{ gameById(c.gameId)?.name }} · {{ c.extensionName }}<template v-if="c.number"> · #{{ c.number }}</template><template v-if="c.location"> · 📍 {{ c.location }}</template>
          </div>
        </div>
        <div class="c-info tags">
          <span v-if="c.rarityName" class="tag">{{ c.rarityName }}</span>
          <span class="tag">{{ c.language }}</span>
          <span v-if="c.finish !== 'Normale'" class="tag">{{ c.finish }}</span>
        </div>
        <div class="c-cond"><span class="cond" :class="'c' + conditionInfo(c.condition)[2]" :title="conditionInfo(c.condition)[1]">{{ c.condition }}</span></div>
        <div class="c-qty">
          <span class="qty">
            <button type="button" aria-label="Retirer un exemplaire" @click="step(c, -1)">−</button>
            <span>{{ c.quantity }}</span>
            <button type="button" aria-label="Ajouter un exemplaire" @click="step(c, 1)">+</button>
          </span>
        </div>
        <div class="c-unit right num muted">{{ eur(c.value) }}</div>
        <div class="c-val right num"><strong>{{ c.value === null ? '—' : eur(c.value * c.quantity) }}</strong></div>
        <div class="c-act rowact"><button class="btn small" type="button" @click="openCard(c)">Modifier</button></div>
      </div>
      <div class="foot">
        <span>{{ plural(shownTotals.qty, 'carte') }}</span>
        <span>Payé : <span class="num">{{ eur(shownTotals.paid) }}</span></span>
        <span>Valeur : <strong class="num">{{ eur(shownTotals.value) }}</strong></span>
      </div>
    </template>
  </section>

  <CardDialog v-model:open="dialogOpen" :card="editing" :default-game-id="filters.gameId" @saved="onSaved" @deleted="onDeleted" />
  <ImportDialog v-model:open="importOpen" :fallback-game="fallbackGame" @imported="load" />
</template>

<style scoped>
.list { background: var(--surface); border: 1px solid var(--line); border-radius: var(--r); overflow: hidden; }
.row { display: grid; grid-template-columns: 6px minmax(0, 2.6fr) minmax(0, 1.2fr) 70px 116px 92px 104px 100px; gap: 14px; align-items: center; padding: 10px 14px 10px 0; border-top: 1px solid var(--line); }
.row:first-child { border-top: 0; }
.row.head { background: var(--surface-2); padding-block: 8px; }
.row .bar { align-self: stretch; background: var(--c); border-radius: 0 3px 3px 0; }
.cname { font-weight: 600; overflow-wrap: anywhere; }
.cmeta { font-size: 13px; color: var(--ink-2); overflow-wrap: anywhere; }
.qty { display: inline-flex; align-items: center; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
.qty button { border: 0; background: transparent; width: 30px; height: 30px; font-size: 17px; line-height: 1; }
.qty button:hover { background: var(--surface-2); }
.qty span { min-width: 30px; text-align: center; font-family: var(--f-mono); font-variant-numeric: tabular-nums; }
.rowact { display: flex; justify-content: flex-end; }
.foot { display: flex; flex-wrap: wrap; gap: 6px 20px; justify-content: flex-end; padding: 12px 14px; border-top: 1px solid var(--line); background: var(--surface-2); font-size: 14px; }
@media (max-width: 920px) {
  .row.head { display: none; }
  .row { grid-template-columns: 6px minmax(0, 1fr) auto; grid-template-areas: "bar name val" "bar info cond" "bar qty act"; row-gap: 8px; }
  .row .bar { grid-area: bar; grid-row: 1 / span 3; }
  .c-name { grid-area: name; } .c-info { grid-area: info; } .c-cond { grid-area: cond; justify-self: end; }
  .c-qty { grid-area: qty; } .c-unit { display: none; } .c-val { grid-area: val; } .c-act { grid-area: act; }
  .count { margin-left: 0; width: 100%; }
}
</style>
