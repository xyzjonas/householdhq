<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { theme, type Theme } from "#lib/theme.svelte.ts";

  const options: { value: Theme; label: () => string }[] = [
    { value: "light", label: () => m.settings_theme_light() },
    { value: "dark", label: () => m.settings_theme_dark() },
  ];
</script>

<section class="flex flex-col gap-4 card bg-surface-50-950 p-6">
  <header class="flex flex-col gap-1">
    <h2 class="text-lg font-bold">{m.settings_theme_title()}</h2>
    <p class="text-sm text-surface-600-400">
      {m.settings_theme_hint()}
    </p>
  </header>
  <fieldset class="flex flex-col gap-2">
    <legend class="mb-2 label-text">{m.settings_theme_legend()}</legend>
    {#each options as option (option.value)}
      <label class="flex items-center gap-2">
        <input
          type="radio"
          class="radio"
          name="theme"
          value={option.value}
          checked={theme.current === option.value}
          onchange={() => theme.set(option.value)}
        />
        <span>{option.label()}</span>
      </label>
    {/each}
  </fieldset>
</section>
