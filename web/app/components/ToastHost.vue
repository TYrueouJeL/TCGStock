<script setup lang="ts">
const { message } = useToast()
</script>

<template>
  <div v-if="message" :key="message" class="toast" role="status">{{ message }}</div>
</template>
