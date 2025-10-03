// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  typescript: {
    typeCheck: true,
  },

  nitro: {
    esbuild: {
      options: {
        tsconfigRaw: {
          compilerOptions: {
            experimentalDecorators: true,
          },
        },
      },
    },
  },

  app: {
    head: {
      title: "Home",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          id: "description",
          name: "description",
          content: "Personal finance helper.",
        },
      ],
    },
  },

  css: [
    "@/assets/css/base.scss",
    "@/assets/css/base_components.scss",
    "@/assets/css/layout.scss",
    "@/assets/css/custom_components.scss",
    "@/assets/css/spinners.scss",
    "@/assets/css/typography.scss",
  ],

  modules: ["@nuxtjs/i18n", "@pinia/nuxt", "@vite-pwa/nuxt", "@unocss/nuxt"],

  i18n: {
    locales: [
      {
        code: "en",
        iso: "en-US",
        file: "en.json",
        name: "English",
      },
      {
        code: "cs",
        iso: "cs-CZ",
        file: "cs.json",
        name: "Čeština",
      },
    ],
    lazy: true,
    langDir: "locales/",
    defaultLocale: "en",
    strategy: "prefix_except_default",
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Household HQ",
      short_name: "Household HQ",
      theme_color: "#2cbd83",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    strategies: "generateSW",
    devOptions: {
      enabled: false,
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        sass: {
          additionalData: '@import "@/assets/css/main.scss";',
        },
      },
    },
  },

  alias: {
    "@server": "../server",
    "@/stores": "../stores",
  },

  compatibilityDate: "2025-01-10",
});
