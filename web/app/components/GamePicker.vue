<script setup lang="ts">
/** A row of game buttons; one game is always selected. */
const model = defineModel<number | null>({ required: true })
defineProps<{ allowAll?: boolean }>()
const { games } = useCatalog()
</script>

<template>
  <div class="game-pick" role="group" aria-label="Choisir le jeu">
    <button v-if="allowAll" type="button" :aria-pressed="model === null" @click="model = null">Tous les jeux</button>
    <button
      v-for="g in games"
      :key="g.id"
      type="button"
      :style="{ '--c': g.color }"
      :aria-pressed="model === g.id"
      @click="model = g.id"
    >
      <span class="dot" />{{ g.name }}
    </button>
  </div>
</template>
