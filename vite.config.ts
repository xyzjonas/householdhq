import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import adapter from "@sveltejs/adapter-node";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      emitTsDeclarations: true,
      // No locale in the URL: this is a signed-in app, so the language is a
      // preference (cookie), seeded from the browser's Accept-Language.
      strategy: ["cookie", "preferredLanguage", "baseLocale"],
    }),
    tailwindcss(),
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
      },
      adapter: adapter(),
    }),
  ],
  test: {
    expect: { requireAssertions: true },
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
});
