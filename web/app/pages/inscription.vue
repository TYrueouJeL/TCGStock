<script setup lang="ts">
import type { ApiProblem } from '~/composables/useApi'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Créer un compte · Classeur TCG' })

const { signup } = useAuth()
const form = reactive({ fullName: '', email: '', password: '', passwordConfirmation: '' })
const problem = ref<ApiProblem | null>(null)
const busy = ref(false)

async function submit() {
  problem.value = null
  busy.value = true
  try {
    await signup({ ...form, fullName: form.fullName.trim() || null })
    await navigateTo('/listes')
  } catch (e) {
    problem.value = apiProblem(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="auth-card">
    <div>
      <h1>Créer un compte</h1>
      <p class="muted">Les raretés de chaque jeu sont prêtes. Tu n’auras plus qu’à ajouter tes extensions.</p>
    </div>
    <form @submit.prevent="submit">
      <label>Nom (facultatif)<input id="su-name" v-model="form.fullName" class="field" autocomplete="name" /></label>
      <label>E-mail
        <input id="su-email" v-model="form.email" class="field" type="email" autocomplete="email" required :aria-invalid="!!problem?.fields.email" />
        <span v-if="problem?.fields.email" class="field-err">{{ problem.fields.email }}</span>
      </label>
      <label>Mot de passe (8 caractères minimum)
        <input id="su-password" v-model="form.password" class="field" type="password" autocomplete="new-password" required :aria-invalid="!!problem?.fields.password" />
        <span v-if="problem?.fields.password" class="field-err">{{ problem.fields.password }}</span>
      </label>
      <label>Confirme le mot de passe
        <input id="su-password2" v-model="form.passwordConfirmation" class="field" type="password" autocomplete="new-password" required :aria-invalid="!!problem?.fields.passwordConfirmation" />
        <span v-if="problem?.fields.passwordConfirmation" class="field-err">{{ problem.fields.passwordConfirmation }}</span>
      </label>
      <p v-if="problem && !Object.keys(problem.fields).length" class="err">{{ problem.message }}</p>
      <button class="btn primary" type="submit" :disabled="busy">Créer mon compte</button>
    </form>
    <p class="hint">Déjà inscrit ? <NuxtLink to="/connexion">Se connecter</NuxtLink></p>
  </div>
</template>
