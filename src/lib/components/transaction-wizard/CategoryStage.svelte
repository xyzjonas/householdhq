<script lang="ts">
  import Check from "@lucide/svelte/icons/check";
  import Search from "@lucide/svelte/icons/search";
  import { categoryIcon, fallbackColor } from "./category-icons";
  import type { WizardCategory } from "./types";

  let {
    categories,
    value = $bindable(),
  }: { categories: WizardCategory[]; value: number | null } = $props();

  let query = $state("");

  const visible = $derived(
    categories.filter((c) =>
      c.name.toLowerCase().includes(query.trim().toLowerCase()),
    ),
  );
</script>

<div class="flex flex-col gap-4">
  <div class="field-group grid-cols-[auto_1fr]">
    <span class="label preset-tonal" aria-hidden="true">
      <Search size={16} />
    </span>
    <input
      class="input"
      type="search"
      placeholder="Search categories"
      aria-label="Search categories"
      bind:value={query}
      onkeydown={(e) => e.key === "Enter" && e.preventDefault()}
    />
  </div>

  <fieldset>
    <legend class="sr-only">Category</legend>
    <div class="grid grid-cols-2 gap-3">
      {#each visible as c (c.id)}
        {@const Icon = categoryIcon(c.icon)}
        <label
          class="category-tile flex cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white p-3 transition-colors active:scale-95 {value ===
          c.id
            ? 'border-[#059669] bg-emerald-50/60'
            : 'border-[#e2e8f0]'}"
        >
          <input
            class="sr-only"
            type="radio"
            name="categoryId"
            value={c.id}
            bind:group={value}
          />
          <span
            class="shrink-0 rounded-xl p-2.5 text-white"
            style="background-color: {c.color ?? fallbackColor}"
          >
            <Icon size={20} aria-hidden="true" />
          </span>
          <span
            class="min-w-0 flex-1 text-sm font-bold break-words text-slate-800"
          >
            {c.name}
          </span>
          {#if value === c.id}
            <Check
              size={16}
              class="shrink-0 text-[#059669]"
              aria-hidden="true"
            />
          {/if}
        </label>
      {:else}
        <p class="col-span-2 py-6 text-center text-sm text-slate-500">
          No category matches “{query}”.
        </p>
      {/each}
    </div>
  </fieldset>
</div>

<style scoped>
  .category-tile {
    box-shadow: 0 2px 8px -2px rgb(15 23 42 / 0.05);
  }
  .category-tile:has(input:focus-visible) {
    outline: 2px solid #059669;
    outline-offset: 2px;
  }
</style>
