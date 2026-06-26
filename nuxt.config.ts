// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/a11y", "@nuxt/test-utils", "@nuxt/eslint"],
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      title: "a11y testing",
    },
  },
});
