<script setup lang="ts">
import type { ParsedImport } from '~/utils/csv'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ fallbackGame: string }>()
const emit = defineEmits<{ imported: [] }>()

const api = useApi()
const { toast } = useToast()
const { lists } = useCatalog()
const text = ref('')
const workbook = ref<{ file: string; result: ParsedImport } | null>(null)
const location = ref('')
const error = ref('')
const fileError = ref('')
const busy = ref(false)
const over = ref(false)

const parsed = computed<ParsedImport>(() => {
  if (workbook.value) return workbook.value.result
  try {
    error.value = ''
    return parseImport(text.value, props.fallbackGame)
  } catch (e: any) {
    error.value = e instanceof SyntaxError ? 'Le JSON n’est pas valide.' : e.message
    return { rows: [], format: 'table', lines: 0 }
  }
})

const summary = computed(() => {
  const { rows, format, lines } = parsed.value
  if (!rows.length) return ''
  if (format === 'wankul') return `${plural(rows.length, 'carte possédée', 'cartes possédées')} sur ${lines} lignes de ta collection Wankul`
  return plural(rows.length, 'carte prête', 'cartes prêtes')
})

watch(open, (v) => {
  if (v) { text.value = ''; error.value = ''; fileError.value = ''; workbook.value = null; location.value = '' }
})
watch(text, () => { if (text.value) workbook.value = null })

const isExcel = (file: File) => /\.xlsx$/i.test(file.name) || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

async function readFile(file?: File | null) {
  if (!file) return
  fileError.value = ''
  if (!isExcel(file)) {
    workbook.value = null
    text.value = await file.text()
    return
  }
  try {
    text.value = ''
    workbook.value = { file: file.name, result: parseSheets(await readXlsx(file), props.fallbackGame) }
  } catch (e: any) {
    workbook.value = null
    fileError.value = e?.message || 'Impossible de lire ce classeur.'
  }
}

async function run() {
  busy.value = true
  try {
    const where = location.value.trim()
    const rows = parsed.value.rows.map((r) => (where && !r.location ? { ...r, location: where } : r))
    const res = await api<{
      data: { created: number; updated: number; skipped: { row: number; reason: string }[]; newLists: { extensions: number; rarities: number } }
    }>('/cards/import', { method: 'POST', body: { rows } })
    const d = res.data
    lists.value = {}
    const parts = []
    if (d.created) parts.push(plural(d.created, 'carte ajoutée', 'cartes ajoutées'))
    if (d.updated) parts.push(plural(d.updated, 'carte mise à jour', 'cartes mises à jour'))
    let msg = parts.join(', ') || 'Aucune carte importée'
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
      Classeur Excel (.xlsx), fichier CSV ou JSON exporté depuis ce site. L’export Excel de ta collection Wankul est reconnu tel quel : seules
      les cartes marquées « J’ai » sont importées. Sinon, colonnes reconnues : jeu, nom, extension, numero, rarete, langue, etat, finition,
      quantite, prix_achat, valeur, emplacement, notes. Les extensions et raretés inconnues sont ajoutées aux listes du jeu, et une carte déjà
      présente (même extension, numéro, nom, langue, état et finition) voit sa quantité remplacée au lieu d’être ajoutée en double.
    </p>
    <label
      class="notice"
      :style="{ borderStyle: 'dashed', textAlign: 'center', borderColor: over ? 'var(--accent)' : undefined, cursor: 'pointer' }"
      @dragover.prevent="over = true"
      @dragleave="over = false"
      @drop.prevent="over = false; readFile($event.dataTransfer?.files[0])"
    >
      Glisse un fichier ici ou <u>choisis-le</u>
      <input id="imp-file" type="file" accept=".xlsx,.csv,.json,.txt,text/csv,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden @change="readFile(($event.target as HTMLInputElement).files?.[0])" />
    </label>
    <p v-if="workbook" class="hint">Classeur lu : <strong>{{ workbook.file }}</strong></p>
    <p v-if="fileError" class="err">{{ fileError }}</p>
    <label class="label" for="imp-text">Ou colle le contenu d’un CSV</label>
    <textarea id="imp-text" v-model="text" class="field" placeholder="jeu;nom;extension;numero;etat;quantite;valeur&#10;Pokémon;Pikachu;Évolutions Prismatiques;028;Near Mint;2;1,5" />
    <label class="label" for="imp-loc">Emplacement des cartes (facultatif)</label>
    <input id="imp-loc" v-model="location" class="field" maxlength="160" placeholder="Classeur Wankul" />
    <p class="hint">Utilisé pour les lignes du fichier qui n’ont pas d’emplacement.</p>
    <p v-if="error" class="err">{{ error }}</p>
    <div class="dlg-foot">
      <span class="hint">{{ summary }}</span>
      <div class="end">
        <button class="btn" type="button" @click="open = false">Annuler</button>
        <button class="btn primary" type="button" :disabled="!parsed.rows.length || busy" @click="run">Importer</button>
      </div>
    </div>
  </AppDialog>
</template>
