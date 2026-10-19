<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Connexion · Classeur TCG' })

const { login } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function submit() {
  error.value = ''
  busy.value = true
  try {
    await login(email.value, password.value)
    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.response?.status === 400 || e?.response?.status === 401
      ? 'E-mail ou mot de passe incorrect.'
      : apiProblem(e).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="auth-card">
    <div>
      <h1>Classeur TCG</h1>
      <p class="muted">Connecte-toi pour retrouver ton stock et tes ouvertures.</p>
    </div>
    <form @submit.prevent="submit">
      <label>E-mail<input id="login-email" v-model="email" class="field" type="email" autocomplete="email" required /></label>
      <label>Mot de passe<input id="login-password" v-model="password" class="field" type="password" autocomplete="current-password" required /></label>
      <p v-if="error" class="err">{{ error }}</p>
      <button class="btn primary" type="submit" :disabled="busy">Se connecter</button>
    </form>
    <p class="hint">Pas encore de compte ? <NuxtLink to="/inscription">Créer un compte</NuxtLink></p>
  </div>
</template>
