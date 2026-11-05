<script lang="ts">
  import Search from "@lucide/svelte/icons/search";
  import CategoryCard from "#lib/components/CategoryCard.svelte";
  import type { WizardCategory } from "./types";

  let {
    categories,
    value = $bindable(),
    onselect,
  }: {
    categories: WizardCategory[];
    value: number | null;
    onselect?: (id: number) => void;
  } = $props();

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
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {#each visible as c (c.id)}
        <CategoryCard
          id={c.id}
          name={c.name}
          icon={c.icon}
          color={c.color}
          selected={value === c.id}
          onselect={(id) => {
            value = id;
            onselect?.(id);
          }}
        />
      {:else}
        <p class="col-span-2 py-6 text-center text-sm text-surface-600-400">
          No category matches “{query}”.
        </p>
      {/each}
    </div>
  </fieldset>
</div>
