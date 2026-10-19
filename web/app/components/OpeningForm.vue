<script setup lang="ts">
import type { Opening, ProductType } from '~/types'
import type { ApiProblem } from '~/composables/useApi'

const props = defineProps<{ opening: Opening | null; defaultGameId: number | null }>()
const emit = defineEmits<{ saved: [opening: Opening, created: boolean]; cancel: [] }>()

const api = useApi()
const { games, lists, loadLists } = useCatalog()

const blank = () => ({
  gameId: props.defaultGameId ?? games.value[0]?.id ?? 0,
  extensionId: '' as number | '',
  productType: 'booster' as ProductType,
  quantity: 1 as number | '',
  unitPrice: '' as number | '',
  pulledValue: '' as number | '',
  openedOn: todayISO(),
  notes: '',
})
const form = reactive(blank())
const problem = ref<ApiProblem | null>(null)
const busy = ref(false)

async function reset() {
  problem.value = null
  const o = props.opening
  Object.assign(form, o ? { ...o, unitPrice: o.unitPrice ?? '', pulledValue: o.pulledValue ?? '', notes: o.notes ?? '' } : blank())
  if (form.gameId) await loadLists(form.gameId)
}
watch(() => props.opening, reset)
onMounted(reset)

const extensions = computed(() => lists.value[form.gameId]?.extensions ?? [])
async function pickGame(id: number) {
  form.gameId = id
  form.extensionId = ''
  await loadLists(id)
}
const total = computed(() => (form.unitPrice === '' || form.quantity === '' ? null : Number(form.unitPrice) * Number(form.quantity)))

async function save() {
  problem.value = null
  const missing: string[] = []
  if (form.extensionId === '') missing.push('l’extension')
  if (form.quantity === '' || Number(form.quantity) < 1) missing.push('la quantité')
  if (!form.openedOn) missing.push('la date')
  if (missing.length) {
    problem.value = { message: 'À compléter : ' + missing.join(', ') + '.', fields: {} }
    return
  }
  const body = {
    gameId: form.gameId,
    extensionId: Number(form.extensionId),
    productType: form.productType,
    quantity: Number(form.quantity),
    unitPrice: form.unitPrice === '' ? null : Number(form.unitPrice),
    pulledValue: form.pulledValue === '' ? null : Number(form.pulledValue),
    openedOn: form.openedOn,
    notes: form.notes || null,
  }
  busy.value = true
  try {
    const res = props.opening
      ? await api<{ data: Opening }>(`/openings/${props.opening.id}`, { method: 'PUT', body })
      : await api<{ data: Opening }>('/openings', { method: 'POST', body })
    emit('saved', res.data, !props.opening)
    if (!props.opening) {
      // Keep game, set, type and date to log the next one quickly.
      Object.assign(form, { quantity: 1, unitPrice: form.unitPrice, pulledValue: '', notes: '' })
    }
  } catch (e) {
    problem.value = apiProblem(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="panel" novalidate @submit.prevent="save">
    <div class="panel-head">
      <h2>{{ opening ? 'Modifier l’ouverture' : 'Noter une ouverture' }}</h2>
      <span class="hint"><span class="req">*</span> champ obligatoire</span>
    </div>
    <div class="grid">
      <div class="s6 fieldset">
        <span class="label">Jeu<span class="req">*</span></span>
        <div class="seg">
          <label v-for="g in games" :key="g.id">
            <input type="radio" name="o-game" :checked="form.gameId === g.id" @change="pickGame(g.id)" />
            <span class="dot" :style="{ '--c': g.color }" />{{ g.name }}
          </label>
        </div>
      </div>
      <div class="s6 fieldset">
        <span class="label">Produit<span class="req">*</span></span>
        <div class="seg">
          <label v-for="p in PRODUCT_TYPES" :key="p.value">
            <input v-model="form.productType" type="radio" name="o-type" :value="p.value" />
            <span class="ptype" :class="'pt-' + p.value">{{ p.label }}</span>
          </label>
        </div>
      </div>
      <label class="s3"><span>Extension<span class="req">*</span></span>
        <select id="o-extension" v-model="form.extensionId" class="field" :aria-invalid="!!problem && form.extensionId === ''">
          <option value="">{{ extensions.length ? 'Choisir…' : 'Aucune extension : ajoute-en d’abord' }}</option>
          <option v-for="e in extensions" :key="e.id" :value="e.id">{{ e.name }}</option>
        </select>
      </label>
      <label class="s1"><span>Quantité<span class="req">*</span></span>
        <input id="o-quantity" v-model="form.quantity" class="field num" type="number" min="1" step="1" inputmode="numeric" />
      </label>
      <label class="s2"><span>Date d’ouverture<span class="req">*</span></span>
        <input id="o-date" v-model="form.openedOn" class="field" type="date" />
      </label>
      <label class="s2">Prix unitaire payé (€)
        <input id="o-price" v-model="form.unitPrice" class="field num" type="number" min="0" step="0.01" inputmode="decimal" />
      </label>
      <label class="s2">Valeur des cartes tirées (€)
        <input id="o-pulled" v-model="form.pulledValue" class="field num" type="number" min="0" step="0.01" inputmode="decimal" placeholder="pour tout le lot" />
      </label>
      <label class="s2">Notes
        <input id="o-notes" v-model="form.notes" class="field" autocomplete="off" placeholder="ex. hit : Luffy SEC" />
      </label>
    </div>
    <p v-if="!extensions.length" class="hint">
      Ce jeu n’a pas encore d’extension. <NuxtLink :to="{ path: '/listes', query: { jeu: form.gameId } }">Ajoute-en une</NuxtLink>.
    </p>
    <p v-if="problem" class="err">{{ problem.message }}</p>
    <div class="dlg-foot">
      <span class="hint">{{ total !== null ? `Total payé : ${eur(total)}` : '' }}</span>
      <div class="end">
        <button v-if="opening" class="btn" type="button" @click="emit('cancel')">Annuler</button>
        <button class="btn primary" type="submit" :disabled="busy">{{ opening ? 'Enregistrer' : 'Ajouter l’ouverture' }}</button>
      </div>
    </div>
  </form>
</template>
