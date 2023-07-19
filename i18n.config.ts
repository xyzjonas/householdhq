import cz from './locales/cz.json';
import en from './locales/en.json';


export default defineI18nConfig(() => ({
    legacy: false,
    locale: 'en',
    messages: {
      en: en,
      cz: cz,
    }
  }))