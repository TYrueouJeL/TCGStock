<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ fallbackGame: string }>()
const emit = defineEmits<{ imported: [] }>()

const api = useApi()
const { toast } = useToast()
const { lists } = useCatalog()
const text = ref('')
const error = ref('')
const busy = ref(false)
const over = ref(false)

const parsed = computed(() => {
  try {
    error.value = ''
    return parseImport(text.value, props.fallbackGame)
  } catch (e: any) {
    error.value = e instanceof SyntaxError ? 'Le JSON n’est pas valide.' : e.message
    return []
  }
})

watch(open, (v) => {
  if (v) { text.value = ''; error.value = '' }
})

function readFile(file?: File | null) {
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => (text.value = String(reader.result ?? ''))
  reader.readAsText(file)
}

async function run() {
  busy.value = true
  try {
    const res = await api<{ data: { created: number; skipped: { row: number; reason: string }[]; newLists: { extensions: number; rarities: number } } }>(
      '/cards/import',
      { method: 'POST', body: { rows: parsed.value } }
    )
    const d = res.data
    lists.value = {}
    let msg = `${plural(d.created, 'carte importée', 'cartes importées')}`
    if (d.newLists.extensions || d.newLists.rarities) msg += `, ${d.newLists.extensions} extension(s) et ${d.newLists.rarities} rareté(s) ajoutées aux listes`
    if (d.skipped.length) msg += `, ${d.skipped.length} ligne(s) ignorée(s)`
    toast(msg)
    emit('imported')
    open.value = false
  } catch (e) {
    error.value = apiProblem(e).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AppDialog v-model:open="open" title="Importer des cartes">
    <p class="hint">
      Fichier CSV (séparateur virgule ou point-virgule) ou JSON exporté depuis ce site. Colonnes reconnues : jeu, nom, extension, numero, rarete,
      langue, etat, finition, quantite, prix_achat, valeur, emplacement, notes. Les extensions et raretés inconnues sont ajoutées aux listes du jeu.
    </p>
    <label
      class="notice"
      :style="{ borderStyle: 'dashed', textAlign: 'center', borderColor: over ? 'var(--accent)' : undefined, cursor: 'pointer' }"
      @dragover.prevent="over = true"
      @dragleave="over = false"
      @drop.prevent="over = false; readFile($event.dataTransfer?.files[0])"
    >
      Glisse un fichier ici ou <u>choisis-le</u>
      <input id="imp-file" type="file" accept=".csv,.json,.txt,text/csv,application/json" hidden @change="readFile(($event.target as HTMLInputElement).files?.[0])" />
    </label>
    <label class="label" for="imp-text">Ou colle le contenu</label>
    <textarea id="imp-text" v-model="text" class="field" placeholder="jeu;nom;extension;numero;etat;quantite;valeur&#10;Pokémon;Pikachu;Évolutions Prismatiques;028;Near Mint;2;1,5" />
    <p v-if="error" class="err">{{ error }}</p>
    <div class="dlg-foot">
      <span class="hint">{{ parsed.length ? plural(parsed.length, 'carte prête', 'cartes prêtes') : '' }}</span>
      <div class="end">
        <button class="btn" type="button" @click="open = false">Annuler</button>
        <button class="btn primary" type="button" :disabled="!parsed.length || busy" @click="run">Importer</button>
      </div>
    </div>
  </AppDialog>
</template>
