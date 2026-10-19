<script setup lang="ts">
import type { ListValue } from '~/types'

const props = defineProps<{ gameId: number; kind: 'extensions' | 'rarities'; items: ListValue[] }>()
const emit = defineEmits<{ changed: [] }>()

const api = useApi()
const { toast } = useToast()
const one = computed(() => (props.kind === 'extensions' ? 'extension' : 'rareté'))
const title = computed(() => (props.kind === 'extensions' ? 'Extensions' : 'Raretés'))
const newName = ref('')
const renamingId = ref<number | null>(null)
const renameValue = ref('')
const busy = ref(false)

async function run(fn: () => Promise<unknown>, ok?: string) {
  busy.value = true
  try {
    await fn()
    if (ok) toast(ok)
    emit('changed')
  } catch (e) {
    toast(apiProblem(e).message)
  } finally {
    busy.value = false
  }
}

function add() {
  const name = newName.value.trim()
  if (!name) return
  run(async () => {
    await api(`/games/${props.gameId}/${props.kind}`, { method: 'POST', body: { name } })
    newName.value = ''
  }, `${one.value === 'extension' ? 'Extension' : 'Rareté'} ajoutée`)
}

function startRename(item: ListValue) {
  renamingId.value = item.id
  renameValue.value = item.name
  nextTick(() => (document.getElementById(`ren-${props.kind}`) as HTMLInputElement | null)?.select())
}
function saveRename(item: ListValue) {
  const name = renameValue.value.trim()
  renamingId.value = null
  if (!name || name === item.name) return
  run(() => api(`/${props.kind}/${item.id}`, { method: 'PATCH', body: { name } }), item.cardCount ? `Renommée, ${plural(item.cardCount, 'carte suit', 'cartes suivent')}` : 'Renommée')
}

function move(index: number, dir: -1 | 1) {
  const ids = props.items.map((i) => i.id)
  const j = index + dir
  ;[ids[index], ids[j]] = [ids[j]!, ids[index]!]
  run(() => api(`/games/${props.gameId}/${props.kind}/order`, { method: 'PUT', body: { ids } }))
}

function remove(item: ListValue) {
  run(() => api(`/${props.kind}/${item.id}`, { method: 'DELETE' }), `« ${item.name} » supprimée`)
}

const usage = (i: ListValue) => {
  const parts = []
  if (i.cardCount) parts.push(plural(i.cardCount, 'carte'))
  if (i.openingCount) parts.push(plural(i.openingCount, 'ouverture'))
  return parts.join(' · ') || 'inutilisée'
}
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <h2>{{ title }}</h2>
      <span class="hint">{{ plural(items.length, one) }}</span>
    </div>
    <form class="add" @submit.prevent="add">
      <input
        :id="`add-${kind}`"
        v-model="newName"
        class="field"
        autocomplete="off"
        :placeholder="kind === 'extensions' ? 'Nouvelle extension, ex. OP-09 Les Nouveaux Empereurs' : 'Nouvelle rareté'"
      />
      <button class="btn primary" type="submit" :disabled="busy || !newName.trim()">Ajouter</button>
    </form>
    <ul class="items">
      <li v-if="!items.length" class="none">Aucune {{ one }} pour ce jeu. Ajoute la première ci-dessus.</li>
      <li v-for="(item, i) in items" :key="item.id" class="item">
        <span class="nm">
          <input
            v-if="renamingId === item.id"
            :id="`ren-${kind}`"
            v-model="renameValue"
            class="field"
            aria-label="Nouveau nom"
            @keydown.enter.prevent="saveRename(item)"
            @keydown.esc.prevent="renamingId = null"
          />
          <template v-else>{{ item.name }}</template>
        </span>
        <span class="uses">{{ usage(item) }}</span>
        <span class="ops">
          <template v-if="renamingId === item.id">
            <button class="icon-btn" type="button" @click="saveRename(item)">OK</button>
            <button class="icon-btn" type="button" @click="renamingId = null">Annuler</button>
          </template>
          <template v-else>
            <button class="icon-btn" type="button" aria-label="Monter" :disabled="busy || i === 0" @click="move(i, -1)">↑</button>
            <button class="icon-btn" type="button" aria-label="Descendre" :disabled="busy || i === items.length - 1" @click="move(i, 1)">↓</button>
            <button class="icon-btn" type="button" :disabled="busy" @click="startRename(item)">Renommer</button>
            <button
              class="icon-btn danger"
              type="button"
              :disabled="busy || item.cardCount > 0 || item.openingCount > 0"
              :title="item.cardCount || item.openingCount ? 'Utilisée : renomme-la ou modifie ces fiches d’abord' : 'Supprimer'"
              @click="remove(item)"
            >Supprimer</button>
          </template>
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.add { display: flex; gap: 8px; }
.items { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
.item { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; padding: 8px 0; border-bottom: 1px solid var(--line); }
.nm { flex: 1 1 140px; min-width: 0; overflow-wrap: anywhere; font-weight: 500; }
.nm .field { padding: 5px 8px; }
.uses { font-size: 12.5px; color: var(--ink-2); white-space: nowrap; }
.ops { display: flex; gap: 4px; }
.none { padding: 14px 0; color: var(--ink-2); font-size: 14px; }
</style>
