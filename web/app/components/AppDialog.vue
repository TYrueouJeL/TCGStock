<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
defineProps<{ title: string }>()

const el = ref<HTMLDialogElement | null>(null)
watch(open, (v) => {
  if (!el.value) return
  if (v && !el.value.open) el.value.showModal()
  if (!v && el.value.open) el.value.close()
})
onMounted(() => {
  if (open.value) el.value?.showModal()
})
function onClick(e: MouseEvent) {
  if (e.target === el.value) open.value = false
}
</script>

<template>
  <dialog ref="el" :aria-label="title" @close="open = false" @click="onClick">
    <div v-if="open" class="dlg">
      <div class="dlg-head">
        <h2>{{ title }}</h2>
        <button class="x" type="button" aria-label="Fermer" @click="open = false">×</button>
      </div>
      <slot />
    </div>
  </dialog>
</template>
