<script setup lang="ts">
useHead({ title: 'Extensions et raretés · Classeur TCG' })

const route = useRoute()
const { games, lists, loadGames, loadLists } = useCatalog()
const gameId = ref<number | null>(null)
const error = ref('')

onMounted(async () => {
  try {
    await loadGames()
    const wanted = Number(route.query.jeu)
    gameId.value = games.value.find((g) => g.id === wanted)?.id ?? games.value[0]?.id ?? null
  } catch (e) {
    error.value = apiProblem(e).message
  }
})
watch(gameId, (id) => {
  if (id) loadLists(id, true).catch((e) => (error.value = apiProblem(e).message))
})
const current = computed(() => (gameId.value ? lists.value[gameId.value] : undefined))
const refresh = () => gameId.value && loadLists(gameId.value, true)
</script>

<template>
  <div class="page-head">
    <div>
      <h1>Extensions et raretés</h1>
      <p>Chaque jeu a ses propres listes. Les formulaires ne proposent que les valeurs définies ici. Renommer une valeur met à jour toutes les fiches qui l’utilisent.</p>
    </div>
  </div>
  <p v-if="error" class="notice warn">{{ error }}</p>
  <GamePicker v-if="games.length" v-model="gameId" />
  <div v-if="gameId && current" class="two">
    <ListPanel :game-id="gameId" kind="extensions" :items="current.extensions" @changed="refresh" />
    <ListPanel :game-id="gameId" kind="rarities" :items="current.rarities" @changed="refresh" />
  </div>
</template>
