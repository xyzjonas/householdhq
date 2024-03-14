// uno.config.ts
import { defineConfig } from 'unocss'
import { presetIcons } from 'unocss'

export default defineConfig({
  rules: [
    ['ml-1', { 'margin-left': '.3rem' }],
    ['mr-1', { 'margin-right': '.3rem' }],
    ['mt', { 'margin-top': '.3rem' }],
    ['mt-1', { 'margin-top': '1rem' }],
    ['mb', { 'margin-bottom': '.3rem' }],
    ['mb-1', { 'margin-bottom': '1rem' }],
    [
      'my',
      {
        'margin-top': '.3rem',
        'margin-bottom': '.3rem',
      }
    ],
    [
      'my-1',
      {
        'margin-top': '1rem',
        'margin-bottom': '1rem',
      }
    ],
    [
      'flex-col',
      {
        'display': 'flex',
        'flex-direction': 'column',
        'gap': '.3rem',
      },
    ],
  ],
  presets: [
    // https://icones.js.org/collection/ic
    presetIcons({
      extraProperties: {
        'vertical-align': 'middle',
      }
    })
  ]
})