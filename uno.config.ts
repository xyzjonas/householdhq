// uno.config.ts
import { defineConfig, presetUno, presetIcons } from "unocss";

export default defineConfig({
  rules: [],
  shortcuts: [
    ["center", "flex items-center justify-center"],
    [
      "row-hover",
      "dark:hover:bg-dark-4 light:hover:bg-gray-3 hover:cursor-pointer p-2 border-rounded transition-all",
    ],
  ],
  presets: [
    // https://icones.js.org/collection/ic
    presetIcons({
      extraProperties: {
        "vertical-align": "middle",
      },
    }),
    presetUno({
      dark: {
        dark: '[data-theme="dark"]',
        light: '[data-theme="light"]',
      },
    }),
  ],
});
