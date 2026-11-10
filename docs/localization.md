# Localization

The UI is localized with [Paraglide JS](https://paraglidejs.com) (compile-time, type-safe) on top of an
[inlang](https://inlang.com) project. English (`en`) is the base language; Czech (`cs`) is included.

| What                         | Where                                 |
| ---------------------------- | ------------------------------------- |
| Translations (edit these)    | `messages/<locale>.json`              |
| Locales + settings           | `project.inlang/settings.json`        |
| Generated message functions  | `src/paraglide/` (git-ignored, never edit) |
| Locale/`Intl` helpers        | `src/lib/i18n.ts`                     |

## For translators

You only ever touch `messages/<locale>.json` — one flat JSON file per language, `key: "text"`.

- Edit by hand, or use the [Fink](https://fink.inlang.com) web editor (open this repository) or the
  [Sherlock](https://inlang.com/m/r7kp499g/app-inlang-ideExtension) VS Code extension.
- `messages/en.json` is the source of truth. Keys are named `<area>_<screen>_<what>`, e.g.
  `accounts_directory_empty_title`, so you can tell where a string appears.
- `{name}` placeholders must be kept exactly as they are (you may move them to fit the grammar).
- Counted messages are written as plural variants. English needs `one` and `other`; Czech needs
  `one`, `few`, `many` and `other` (`many` is used for fractions, e.g. "2,5 položky"):

  ```json
  "accounts_count": [
    {
      "declarations": ["input count", "local countPlural = count: plural"],
      "selectors": ["countPlural"],
      "match": {
        "countPlural=one": "{count} účet",
        "countPlural=few": "{count} účty",
        "countPlural=many": "{count} účtu",
        "countPlural=other": "{count} účtů"
      }
    }
  ]
  ```

- Run `npm run check:i18n` to find missing or empty translations and placeholder/plural mismatches.
  CI runs it on every PR.

## Adding a language

1. Add the locale code to `locales` in `project.inlang/settings.json`.
2. Create `messages/<locale>.json` (copy `en.json`) and translate it.
3. In `src/lib/i18n.ts` add the locale to `INTL_TAGS` (BCP 47 tag used for dates/numbers, e.g. `de: "de-DE"`)
   and `LANGUAGE_NAMES` (its name in its own language). TypeScript points out both if you forget.

The language picker in Settings lists every locale automatically.

## How the language is chosen

Cookie (`PARAGLIDE_LOCALE`, set by the picker in Settings) → the browser's `Accept-Language` → `en`.
There is no locale in the URL. The server renders `<html lang>` per request.

## For developers

- Use messages, never literals: `import { m } from "#paraglide/messages.js"` → `{m.accounts_title()}`.
- Whole sentences with `{params}`; never concatenate pieces of a sentence (word order differs per language).
  Pre-format money/dates/numbers (`#lib/format.ts`) before passing them in.
- Don't call `m.*()` or build `Intl.*` formatters at module level — the server handles many languages in one
  process. Use functions/getters or compute inside components, and take the locale from `intlLocale()`.
- Don't look messages up dynamically (`m[key]`); ESLint forbids it. Map enum → label with a `switch`.
- Server code (`fail()`, `error()`, thrown core errors, Zod schemas) may use `m.*()` inside a request. Zod messages must be lazy:
  `z.string().min(8, { error: () => m.core_password_min() })`.
- Not localized on purpose: data stored in the database (default account names, auto-generated transaction
  descriptions like "Balance checkpoint adjustment") and `static/manifest.webmanifest`.
