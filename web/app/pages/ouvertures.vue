<script setup lang="ts">
import type { Opening, ProductType } from '~/types'

useHead({ title: 'Ouvertures · Classeur TCG' })

const api = useApi()
const { toast } = useToast()
const { games, loadGames, gameById } = useCatalog()

const openings = ref<Opening[]>([])
const loading = ref(true)
const error = ref('')
const gameFilter = ref<number | null>(null)
const typeFilter = ref<ProductType | ''>('')
const editing = ref<Opening | null>(null)
const confirmId = ref<number | null>(null)

async function load() {
  error.value = ''
  try {
    await loadGames()
    openings.value = (await api<{ data: Opening[] }>('/openings')).data
  } catch (e) {
    error.value = apiProblem(e).message
  } finally {
    loading.value = false
  }
}
onMounted(load)

const shown = computed(() =>
  openings.value.filter((o) => (gameFilter.value === null || o.gameId === gameFilter.value) && (!typeFilter.value || o.productType === typeFilter.value))
)
const counts = computed(() =>
  PRODUCT_TYPES.map((p) => ({ ...p, n: shown.value.filter((o) => o.productType === p.value).reduce((s, o) => s + o.quantity, 0) }))
)
const spent = computed(() => shown.value.reduce((s, o) => s + (o.unitPrice ?? 0) * o.quantity, 0))

function onSaved(o: Opening, created: boolean) {
  const i = openings.value.findIndex((x) => x.id === o.id)
  if (i >= 0) openings.value[i] = o
  else openings.value.unshift(o)
  openings.value.sort((a, b) => b.openedOn.localeCompare(a.openedOn) || b.id - a.id)
  editing.value = null
  toast(created ? `${productLabel(o.productType, o.quantity)} noté${o.quantity > 1 ? 's' : ''}` : 'Ouverture modifiée')
}
async function remove(o: Opening) {
  try {
    await api(`/openings/${o.id}`, { method: 'DELETE' })
    openings.value = openings.value.filter((x) => x.id !== o.id)
    toast('Ouverture supprimée')
  } catch (e) {
    toast(apiProblem(e).message)
  } finally {
    confirmId.value = null
  }
}
function edit(o: Opening) {
  editing.value = o
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="page-head">
    <div>
      <h1>Ouvertures</h1>
      <p>Note chaque booster, display ou starter deck que tu ouvres. Les chiffres alimentent la page Statistiques.</p>
    </div>
    <NuxtLink class="btn" to="/stats">Voir les statistiques</NuxtLink>
  </div>

  <p v-if="error" class="notice warn">{{ error }} <button class="linkbtn" type="button" @click="load">Réessayer</button></p>

  <OpeningForm v-if="games.length" :opening="editing" :default-game-id="gameFilter" @saved="onSaved" @cancel="editing = null" />

  <section class="panel">
    <div class="panel-head">
      <h2>Historique</h2>
      <span class="hint">
        <template v-for="(c, i) in counts" :key="c.value">{{ i ? ' · ' : '' }}{{ plural(c.n, c.label.toLowerCase()) }}</template>
        <template v-if="spent"> · {{ eur(spent) }} dépensés</template>
      </span>
    </div>
    <div class="toolbar">
      <GamePicker v-model="gameFilter" allow-all />
      <select id="f-type" v-model="typeFilter" class="field auto" aria-label="Filtrer par produit">
        <option value="">Tous les produits</option>
        <option v-for="p in PRODUCT_TYPES" :key="p.value" :value="p.value">{{ p.plural }}</option>
      </select>
    </div>
    <div v-if="loading" class="empty"><p>Chargement…</p></div>
    <div v-else-if="!shown.length" class="empty">
      <p>{{ openings.length ? 'Aucune ouverture ne correspond à ces filtres.' : 'Aucune ouverture notée pour l’instant. Utilise le formulaire ci-dessus après ta prochaine session.' }}</p>
    </div>
    <div v-else class="table-wrap">
      <table class="data">
        <thead>
          <tr>
            <th>Date</th><th>Jeu</th><th>Extension</th><th>Produit</th><th class="num">Qté</th><th class="num">Payé</th><th class="num">Tiré</th><th>Notes</th><th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in shown" :key="o.id">
            <td style="white-space: nowrap">{{ dateFr(o.openedOn) }}</td>
            <td style="white-space: nowrap"><span class="dot" :style="{ '--c': gameById(o.gameId)?.color }" /> {{ gameById(o.gameId)?.name }}</td>
            <td>{{ o.extensionName }}</td>
            <td><span class="ptype" :class="'pt-' + o.productType">{{ productLabel(o.productType) }}</span></td>
            <td class="num">{{ o.quantity }}</td>
            <td class="num">{{ o.unitPrice === null ? '—' : eur(o.unitPrice * o.quantity) }}</td>
            <td class="num">{{ eur(o.pulledValue) }}</td>
            <td class="muted">{{ o.notes }}</td>
            <td style="white-space: nowrap; text-align: right">
              <template v-if="confirmId === o.id">
                <button class="btn small danger solid" type="button" @click="remove(o)">Supprimer</button>
                <button class="btn small" type="button" @click="confirmId = null">Non</button>
              </template>
              <template v-else>
                <button class="btn small" type="button" @click="edit(o)">Modifier</button>
                <button class="btn small danger" type="button" aria-label="Supprimer" @click="confirmId = o.id">×</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
