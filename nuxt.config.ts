
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    nitro: {
        esbuild: {
            options: {
                tsconfigRaw: {
                    compilerOptions: {
                        experimentalDecorators: true
                    }
                }
            }
        },
    },
    app: {
        pageTransition: { name: 'page', mode: 'out-in' },
        head: {
            title: 'Home',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { hid: 'description', name: 'description', content: 'Personal finance helper.' }
              ],
        },
    },
    css: [ 
        '@/assets/css/main.scss',
        '@/assets/fontawesome/css/all.css'
    ],
    modules: [
        '@nuxtjs/i18n',
        '@pinia/nuxt',
        '@vite-pwa/nuxt'
    ],
    i18n: {
        locales: ['en', 'fr', 'es'],
        defaultLocale: 'en',
        vueI18n: './i18n.config.ts',
    },
    pwa: {
        registerType: "autoUpdate",
        manifest: {
            name: 'Household HQ PWA',
            short_name: 'HomePWA',
            theme_color: '#000000',
            icons: [
                {
                  src: 'manifest-icon-192.maskable.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
                {
                    src: 'manifest-icon-512.maskable.png',
                    sizes: '512x512',
                    type: 'image/png',
                },
                {
                    src: 'manifest-icon-512.maskable.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable',
                },
            ],
        },
        strategies: "generateSW",
        devOptions: {
            enabled: true,
        }
    },
    vite: {
        css: {
            preprocessorOptions: {
                sass: {
                    additionalData: '@import "@/assets/css/main.scss";'
                }
            }
        }
    }
})
