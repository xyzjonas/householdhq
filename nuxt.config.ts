import 'dotenv/config';
// import { cs } from 'locales/cz';


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
    runtimeConfig: {
        public: {
            auth0_domain: process.env.AUTH0_DOMAIN,
            auth0_clientId: process.env.AUTH0_CLIENT_ID,
            auth0_redirectUri: process.env.AUTH0_REDIRECT_URI,
            auth0_audience: process.env.AUTH0_AUDIENCE,
        }
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
    ],
    i18n: {
        locales: ['en', 'fr', 'es'],
        defaultLocale: 'en',
        vueI18n: './i18n.config.ts',
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
