import cz from './locales/cz.json';
import en from './locales/en.json';


// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        pageTransition: { name: 'page', mode: 'out-in' }
    },
    head: {
        title: 'household HQ'
    },
    css: [ 
        '@/assets/css/main.scss',
        '@/assets/iconicss/iconicss.min.css',
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
            }
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
