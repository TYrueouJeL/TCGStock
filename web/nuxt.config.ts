// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // The app talks to the AdonisJS API with a bearer token kept in a cookie,
  // so it runs as a single-page app.
  ssr: false,

  css: ['~/assets/main.css'],

  runtimeConfig: {
    public: {
      // Override with NUXT_PUBLIC_API_BASE in production.
      apiBase: 'http://localhost:3333/api/v1',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Classeur TCG',
      meta: [{ name: 'description', content: 'Stock de cartes One Piece, Pokémon, Wankul et Riftbound, et suivi des ouvertures.' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },
})
