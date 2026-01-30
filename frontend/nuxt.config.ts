// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/i18n', '@pinia/nuxt', '@nuxtjs/tailwindcss'],
  i18n: {
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'es', file: 'es.json' }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'es'
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001'
    }
  }
})
