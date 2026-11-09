<script lang="ts" generics="T extends CategoryItem">
  import type { Snippet } from "svelte";
  import { Tabs } from "@skeletonlabs/skeleton-svelte";
  import Search from "@lucide/svelte/icons/search";
  import {
    countForFilter,
    filterItems,
    filtersFor,
    sortItems,
    sortOptions,
    type CategoryItem,
    type FilterId,
    type SortId,
  } from "#lib/categories-view.ts";

  let {
    items,
    singular = "category",
    plural = "categories",
    children,
  }: {
    items: T[];
    /** What the items are called, lowercase ("category" / "categories"). */
    singular?: string;
    plural?: string;
    /** Renders the filtered, sorted items (table on desktop, cards on mobile). */
    children: Snippet<[T[]]>;
  } = $props();

  let filter = $state<FilterId>("all");
  let sort = $state<SortId>("spend");
  let query = $state("");

  const visible = $derived(
    sortItems(filterItems(items, { filter, query }), sort),
  );
</script>

<section aria-labelledby="directory-heading" class="flex flex-col gap-4">
  <h2 id="directory-heading" class="sr-only">
    {singular[0].toUpperCase() + singular.slice(1)} directory
  </h2>

  <Tabs value={filter} onValueChange={(e) => (filter = e.value as FilterId)}>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <Tabs.List
        class="flex gap-2 overflow-x-auto border-0 lg:mb-0! lg:border-b-0! lg:pb-0!"
      >
        {#each filtersFor(plural) as f (f.id)}
          <Tabs.Trigger
            value={f.id}
            class="btn min-h-12 rounded-full text-xs font-semibold whitespace-nowrap lg:min-h-0 {filter ===
            f.id
              ? 'preset-filled-surface-950-50'
              : 'border border-surface-200-800 preset-filled-surface-50-950'}"
          >
            {f.label} ({countForFilter(items, f.id)})
          </Tabs.Trigger>
        {/each}
      </Tabs.List>

      <div class="flex flex-wrap items-center gap-3">
        <div class="field-group grid-cols-[auto_1fr]">
          <span class="label preset-tonal">
            <Search size={16} aria-hidden="true" />
          </span>
          <input
            class="input"
            type="search"
            placeholder="Search {singular} or note"
            aria-label="Search {plural}"
            bind:value={query}
          />
        </div>
        <label class="flex items-center gap-2 text-sm">
          <span class="text-surface-600-400">Sort</span>
          <select class="select w-auto" bind:value={sort}>
            {#each sortOptions as o (o.id)}
              <option value={o.id}>{o.label}</option>
            {/each}
          </select>
        </label>
      </div>
    </div>
  </Tabs>

  {@render children(visible)}
</section>
