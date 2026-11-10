<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { LANGUAGE_NAMES, getLocale, locales, setLocale } from "#lib/i18n.ts";
</script>

<section class="flex flex-col gap-4 card bg-surface-50-950 p-6">
  <header class="flex flex-col gap-1">
    <h2 class="text-lg font-bold">{m.settings_language_title()}</h2>
    <p class="text-sm text-surface-600-400">
      {m.settings_language_hint()}
    </p>
  </header>
  <fieldset class="flex flex-col gap-2">
    <legend class="mb-2 label-text">{m.settings_language_label()}</legend>
    {#each locales as locale (locale)}
      <label class="flex items-center gap-2">
        <input
          type="radio"
          class="radio"
          name="language"
          value={locale}
          checked={getLocale() === locale}
          onchange={() => setLocale(locale)}
        />
        <span lang={locale}>{LANGUAGE_NAMES[locale]}</span>
      </label>
    {/each}
  </fieldset>
</section>
