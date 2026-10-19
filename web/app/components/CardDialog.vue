<script setup lang="ts">
import type { Card } from '~/types'
import type { ApiProblem } from '~/composables/useApi'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ card: Card | null; defaultGameId: number | null }>()
const emit = defineEmits<{ saved: [card: Card, created: boolean]; deleted: [id: number] }>()

const api = useApi()
const { games, lists, loadLists } = useCatalog()

const empty = () => ({
  gameId: props.defaultGameId ?? games.value[0]?.id ?? 0,
  name: '',
  number: '',
  extensionId: '' as number | '',
  rarityId: '' as number | '',
  language: 'FR',
  condition: 'NM',
  finish: 'Normale',
  quantity: 1 as number | '',
  purchasePrice: '' as number | '',
  value: '' as number | '',
  location: '',
  notes: '',
})
const form = reactive(empty())
const problem = ref<ApiProblem | null>(null)
const missing = ref<Set<string>>(new Set())
const busy = ref(false)
const confirmDelete = ref(false)

watch(open, async (v) => {
  if (!v) return
  problem.value = null
  missing.value = new Set()
  confirmDelete.value = false
  const c = props.card
  Object.assign(
    form,
    c
      ? { ...c, purchasePrice: c.purchasePrice ?? '', value: c.value ?? '', notes: c.notes ?? '' }
      : empty()
  )
  await loadLists(form.gameId)
})

const current = computed(() => lists.value[form.gameId] ?? { extensions: [], rarities: [] })
async function pickGame(id: number) {
  form.gameId = id
  form.extensionId = ''
  form.rarityId = ''
  await loadLists(id)
}

const REQUIRED: [keyof typeof form, string][] = [
  ['name', 'le nom'],
  ['number', 'le numéro'],
  ['extensionId', 'l’extension'],
  ['rarityId', 'la rareté'],
  ['language', 'la langue'],
  ['condition', 'l’état'],
  ['finish', 'la finition'],
  ['quantity', 'la quantité'],
  ['location', 'l’emplacement'],
]
const invalid = (f: string) => missing.value.has(f) || !!problem.value?.fields[f]

async function save() {
  problem.value = null
  const miss = REQUIRED.filter(([k]) => String(form[k] ?? '').trim() === '')
  missing.value = new Set(miss.map(([k]) => k))
  if (miss.length) {
    const names = miss.map(([, n]) => n)
    problem.value = {
      message: 'À compléter : ' + (names.length > 1 ? names.slice(0, -1).join(', ') + ' et ' + names.at(-1) : names[0]) + '.',
      fields: {},
    }
    return
  }
  const body = {
    gameId: form.gameId,
    extensionId: Number(form.extensionId),
    rarityId: Number(form.rarityId),
    name: form.name,
    number: form.number,
    language: form.language,
    condition: form.condition,
    finish: form.finish,
    quantity: Number(form.quantity),
    purchasePrice: form.purchasePrice === '' ? null : Number(form.purchasePrice),
    value: form.value === '' ? null : Number(form.value),
    location: form.location,
    notes: form.notes || null,
  }
  busy.value = true
  try {
    const res = props.card
      ? await api<{ data: Card }>(`/cards/${props.card.id}`, { method: 'PUT', body })
      : await api<{ data: Card }>('/cards', { method: 'POST', body })
    emit('saved', res.data, !props.card)
    loadLists(form.gameId, true)
    open.value = false
  } catch (e) {
    problem.value = apiProblem(e)
  } finally {
    busy.value = false
  }
}

async function remove() {
  if (!props.card) return
  busy.value = true
  try {
    await api(`/cards/${props.card.id}`, { method: 'DELETE' })
    emit('deleted', props.card.id)
    loadLists(props.card.gameId, true)
    open.value = false
  } catch (e) {
    problem.value = apiProblem(e)
  } finally {
    busy.value = false
  }
}
const clearField = (f: string) => missing.value.delete(f)
</script>

<template>
  <AppDialog v-model:open="open" :title="card ? 'Modifier la carte' : 'Ajouter une carte'">
    <form class="dlg" style="padding: 0" novalidate @submit.prevent="save" @input="clearField(($event.target as HTMLInputElement).id.replace('c-', ''))">
      <div class="grid">
        <div class="s6 fieldset">
          <span class="label">Jeu<span class="req">*</span></span>
          <div class="seg">
            <label v-for="g in games" :key="g.id">
              <input type="radio" name="c-game" :checked="form.gameId === g.id" @change="pickGame(g.id)" />
              <span class="dot" :style="{ '--c': g.color }" />{{ g.name }}
            </label>
          </div>
        </div>
        <label class="s4"><span>Nom de la carte<span class="req">*</span></span>
          <input id="c-name" v-model="form.name" class="field" autocomplete="off" placeholder="ex. Monkey D. Luffy" :aria-invalid="invalid('name')" />
        </label>
        <label class="s2 wide-m"><span>Numéro<span class="req">*</span></span>
          <input id="c-number" v-model="form.number" class="field" autocomplete="off" placeholder="ex. OP01-024" :aria-invalid="invalid('number')" />
        </label>
        <label class="s3"><span>Extension<span class="req">*</span></span>
          <select id="c-extensionId" v-model="form.extensionId" class="field" :aria-invalid="invalid('extensionId')" @change="clearField('extensionId')">
            <option value="">{{ current.extensions.length ? 'Choisir…' : 'Aucune extension : ajoute-en d’abord' }}</option>
            <option v-for="e in current.extensions" :key="e.id" :value="e.id">{{ e.name }}</option>
          </select>
          <span v-if="problem?.fields.extensionId" class="field-err">{{ problem.fields.extensionId }}</span>
        </label>
        <label class="s3"><span>Rareté<span class="req">*</span></span>
          <select id="c-rarityId" v-model="form.rarityId" class="field" :aria-invalid="invalid('rarityId')" @change="clearField('rarityId')">
            <option value="">{{ current.rarities.length ? 'Choisir…' : 'Aucune rareté : ajoute-en d’abord' }}</option>
            <option v-for="r in current.rarities" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </label>
        <p class="hint s6">
          Une extension ou une rareté manque ?
          <NuxtLink :to="{ path: '/listes', query: { jeu: form.gameId } }" @click="open = false">Gérer les listes de ce jeu</NuxtLink>
        </p>
        <label class="s2"><span>Langue<span class="req">*</span></span>
          <select id="c-language" v-model="form.language" class="field"><option v-for="l in LANGUAGES" :key="l">{{ l }}</option></select>
        </label>
        <label class="s2"><span>État<span class="req">*</span></span>
          <select id="c-condition" v-model="form.condition" class="field">
            <option v-for="c in CONDITIONS" :key="c[0]" :value="c[0]">{{ c[0] }} · {{ c[1] }}</option>
          </select>
        </label>
        <label class="s2"><span>Finition<span class="req">*</span></span>
          <select id="c-finish" v-model="form.finish" class="field"><option v-for="f in FINISHES" :key="f">{{ f }}</option></select>
        </label>
        <label class="s2"><span>Quantité<span class="req">*</span></span>
          <input id="c-quantity" v-model="form.quantity" class="field num" type="number" min="0" step="1" inputmode="numeric" :aria-invalid="invalid('quantity')" />
        </label>
        <label class="s2">Prix d’achat unitaire (€)
          <input id="c-purchasePrice" v-model="form.purchasePrice" class="field num" type="number" min="0" step="0.01" inputmode="decimal" />
        </label>
        <label class="s2">Valeur unitaire (€)
          <input id="c-value" v-model="form.value" class="field num" type="number" min="0" step="0.01" inputmode="decimal" placeholder="cote actuelle" />
        </label>
        <label class="s3"><span>Emplacement<span class="req">*</span></span>
          <input id="c-location" v-model="form.location" class="field" autocomplete="off" placeholder="ex. Classeur 2, page 14" :aria-invalid="invalid('location')" />
        </label>
        <label class="s3">Notes
          <input id="c-notes" v-model="form.notes" class="field" autocomplete="off" placeholder="ex. gradée PSA 9, à vendre…" />
        </label>
      </div>
      <p class="hint"><span class="req">*</span> champ obligatoire</p>
      <p v-if="problem" class="err">{{ problem.message }}</p>
      <div class="dlg-foot">
        <div v-if="card">
          <template v-if="confirmDelete">
            <span class="hint" style="margin-right: 8px">Supprimer cette fiche ?</span>
            <button class="btn small danger solid" type="button" :disabled="busy" @click="remove">Oui, supprimer</button>
            <button class="btn small" type="button" @click="confirmDelete = false">Non</button>
          </template>
          <button v-else class="btn danger" type="button" @click="confirmDelete = true">Supprimer</button>
        </div>
        <div class="end">
          <button class="btn" type="button" @click="open = false">Annuler</button>
          <button class="btn primary" type="submit" :disabled="busy">Enregistrer</button>
        </div>
      </div>
    </form>
  </AppDialog>
</template>
