<script lang="ts">
  import { resolve } from "$app/paths";
  import BurnConcentration from "#lib/components/categories/BurnConcentration.svelte";
  import CategoriesDirectory from "#lib/components/categories/CategoriesDirectory.svelte";
  import CreateCategoryDialog from "#lib/components/categories/CreateCategoryDialog.svelte";
  import MonthSwitcher from "#lib/components/categories/MonthSwitcher.svelte";
  import TagCards from "#lib/components/tags/TagCards.svelte";
  import TagTable from "#lib/components/tags/TagTable.svelte";
  import { burnConcentration, monthLabel } from "#lib/categories-view.ts";
  import { buildTagItems } from "#lib/tags-view.ts";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  const items = $derived(buildTagItems(data.tags));
  const label = $derived(monthLabel(data.month));
</script>

<svelte:head><title>Tags · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex flex-col gap-2">
      <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
        <ol class="flex gap-2">
          <li><a class="anchor" href={resolve("/")}>Home</a></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Tags ({items.length} total)</li>
        </ol>
      </nav>
      <h1 class="text-2xl font-extrabold tracking-tight">
        Tags & cross-cutting labels
      </h1>
      <p class="text-sm text-surface-600-400">{label} household ledger</p>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <MonthSwitcher
        month={data.month}
        previous={data.previousMonth}
        next={data.nextMonth}
        route="/tags"
      />
      <CreateCategoryDialog
        noun="tag"
        example="Holiday 2026"
        message={form?.message}
      />
    </div>
  </header>

  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
    <CategoriesDirectory {items} singular="tag" plural="tags">
      {#snippet children(visible)}
        <TagTable items={visible} monthLabel={label} />
        <TagCards items={visible} />
      {/snippet}
    </CategoriesDirectory>
    <aside aria-label="Spending insights" class="flex flex-col gap-6">
      <BurnConcentration slices={burnConcentration(items)} />
    </aside>
  </div>
</div>
