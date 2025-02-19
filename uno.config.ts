// uno.config.ts
import { defineConfig, presetUno, presetIcons } from 'unocss'


export default defineConfig({
  rules: [],
  presets: [
    // https://icones.js.org/collection/ic
    presetIcons({
      extraProperties: {
        'vertical-align': 'middle',
      }
    }),
    presetUno({
      dark: {
        dark: '[data-theme="dark"]',
        light: '[data-theme="light"]',
      }
    }),
  ]
})