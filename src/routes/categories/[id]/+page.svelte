<script lang="ts">
  import { resolve } from "$app/paths";
  import CategoryEntries from "#lib/components/categories/detail/CategoryEntries.svelte";
  import CategoryGlyph from "#lib/components/categories/CategoryGlyph.svelte";
  import CategoryProperties from "#lib/components/categories/detail/CategoryProperties.svelte";
  import SpendingChart from "#lib/components/categories/detail/SpendingChart.svelte";
  import SpendingHero from "#lib/components/categories/detail/SpendingHero.svelte";
  import { patchCategory } from "#lib/categories-client.ts";
  import { viewQuery, type DetailView } from "#lib/category-detail.ts";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  /** Query string of this page with some view state replaced. */
  const queryFor = (changes: Partial<DetailView> = {}) =>
    viewQuery(data.view, changes, data.currentMonth);
</script>

<svelte:head><title>{data.category.name} · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <header class="flex flex-col gap-2">
    <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
      <ol class="flex gap-2">
        <li><a class="anchor" href={resolve("/")}>Home</a></li>
        <li aria-hidden="true">›</li>
        <li><a class="anchor" href={resolve("/categories")}>Categories</a></li>
        <li aria-hidden="true">›</li>
        <li aria-current="page" class="min-w-0 wrap-anywhere">
          {data.category.id} ({data.category.name})
        </li>
      </ol>
    </nav>
    <h1
      class="flex flex-wrap items-center gap-3 text-2xl font-extrabold tracking-tight wrap-anywhere"
    >
      <CategoryGlyph icon={data.category.icon} color={data.category.color} />
      {data.category.name}
    </h1>
    {#if data.category.description}
      <p class="text-sm wrap-anywhere text-surface-600-400">
        {data.category.description}
      </p>
    {/if}
  </header>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <SpendingHero
      month={data.month}
      previousMonth={data.previousMonth}
      nextMonth={data.nextMonth}
      route="/categories/[id]"
      id={data.category.id}
      {queryFor}
      spent={data.spent}
      delta={data.delta}
      average={data.average}
      entryCount={data.monthEntryCount}
    />
    <SpendingChart
      series={data.series}
      incomeSeries={data.incomeSeries}
      transferSeries={data.transferSeries}
      range={data.view.range}
      route="/categories/[id]"
      id={data.category.id}
      {queryFor}
      color={data.category.color}
    />
  </div>

  {#key data.category.id}
    <CategoryProperties category={data.category} patch={patchCategory} />
  {/key}

  <CategoryEntries
    name={data.category.name}
    entries={data.entries}
    total={data.total}
    view={data.view}
    route="/categories/[id]"
    id={data.category.id}
    {queryFor}
  />
</div>
