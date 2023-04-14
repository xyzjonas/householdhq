import cz from './locales/cz.json';
import en from './locales/en.json';
import 'dotenv/config';


// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            auth0_domain: process.env.AUTH0_DOMAIN,
            auth0_clientId: process.env.AUTH0_CLIENT_ID,
        }
        // auth0_domain: "",
        // auth0_clientId: ""
    },
    app: {
        pageTransition: { name: 'page', mode: 'out-in' },
        head: {
            title: 'Home',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { hid: 'description', name: 'description', content: 'Nuxt.js project' }
              ],
              link: [
                { rel: 'icon', type: 'image/x-icon', href: 'https://nuxtjs.org/favicon.ico' }
              ]
        },
    },
    css: [ 
        '@/assets/css/main.scss',
        '@/assets/fontawesome/css/all.css'
    ],
    modules: [
        [
            '@nuxtjs/i18n',
            {
                vueI18nLoader: true,
                defaultLocale: 'cs',
                locales: [
                    {
                        code: 'en',
                        iso: 'en-US',
                        name: "English"
                    },
                    {
                        code: 'cs',
                        iso: 'cs',
                        name: 'Česky'
                    }
                ],
                vueI18n: {
                    messages: {
                        cs: cz,
                        en: en,
                    }
                }
            },
        ]
    ],
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
