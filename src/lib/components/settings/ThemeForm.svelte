<script lang="ts">
  import { theme, type Theme } from "#lib/theme.svelte";

  const options: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];
</script>

<section class="flex flex-col gap-4 card bg-surface-50-950 p-6">
  <header class="flex flex-col gap-1">
    <h2 class="text-lg font-bold">Appearance</h2>
    <p class="text-sm text-surface-600-400">
      Stored in this browser only. Applied immediately.
    </p>
  </header>
  <fieldset class="flex flex-col gap-2">
    <legend class="mb-2 label-text">Theme</legend>
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
        <span>{option.label}</span>
      </label>
    {/each}
  </fieldset>
</section>
