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
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      title: "Home",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { hid: "description", name: "description", content: "Personal finance helper." },
      ],
    },
  },
  css: ["@/assets/css/main.scss"],
  modules: [
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
    '@unocss/nuxt',
  ],
  i18n: {
    locales: ["en", "fr", "es", "cs"],
    defaultLocale: "en",
    vueI18n: "./i18n.config.ts",
    strategy: "no_prefix",
  },
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Household HQ PWA",
      short_name: "HomePWA",
      theme_color: "#eee",
      icons: [
        {
          src: "manifest-icon-192.maskable.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "manifest-icon-512.maskable.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "manifest-icon-512.maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    strategies: "generateSW",
    devOptions: {
      enabled: true,
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
  }
});
