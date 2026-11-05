<script lang="ts">
  import { Tabs } from "@skeletonlabs/skeleton-svelte";
  import Search from "@lucide/svelte/icons/search";
  import {
    countForFilter,
    filterItems,
    filters,
    sortItems,
    sortOptions,
    type CategoryItem,
    type FilterId,
    type SortId,
  } from "#lib/categories-view.ts";
  import CategoryCards from "./CategoryCards.svelte";
  import CategoryTable from "./CategoryTable.svelte";

  let { items, monthLabel }: { items: CategoryItem[]; monthLabel: string } =
    $props();

  let filter = $state<FilterId>("all");
  let sort = $state<SortId>("spend");
  let query = $state("");

  const visible = $derived(
    sortItems(filterItems(items, { filter, query }), sort),
  );
</script>

<section aria-labelledby="directory-heading" class="flex flex-col gap-4">
  <h2 id="directory-heading" class="sr-only">Category directory</h2>

  <Tabs value={filter} onValueChange={(e) => (filter = e.value as FilterId)}>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <Tabs.List
        class="flex gap-2 overflow-x-auto border-0 lg:mb-0! lg:border-b-0! lg:pb-0!"
      >
        {#each filters as f (f.id)}
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
            placeholder="Search category or note"
            aria-label="Search categories"
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

  <CategoryTable items={visible} {monthLabel} />
  <CategoryCards items={visible} />
</section>
