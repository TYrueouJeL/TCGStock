<script setup lang="ts">
const { user, logout } = useAuth()
</script>

<template>
  <div>
    <header class="topbar">
      <div class="topbar-in">
        <NuxtLink to="/" class="brand">Classeur TCG</NuxtLink>
        <nav class="nav" aria-label="Pages">
          <NuxtLink to="/">Stock</NuxtLink>
          <NuxtLink to="/ouvertures">Ouvertures</NuxtLink>
          <NuxtLink to="/stats">Statistiques</NuxtLink>
          <NuxtLink to="/listes">Extensions et raretés</NuxtLink>
        </nav>
        <div class="who">
          <span v-if="user">{{ user.fullName || user.email }}</span>
          <button class="btn small" type="button" @click="logout">Déconnexion</button>
        </div>
      </div>
    </header>
    <main class="wrap">
      <slot />
    </main>
  </div>
</template>
