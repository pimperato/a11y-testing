// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/a11y', '@nuxt/test-utils'],
  // Set globally so document-title / html-has-lang don't fire on every page —
  // each example page is then left with only its single intentional defect.
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'a11y testing',
    },
  },
})