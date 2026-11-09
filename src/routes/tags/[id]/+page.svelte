<script lang="ts">
  import { resolve } from "$app/paths";
  import CategoryEntries from "#lib/components/categories/detail/CategoryEntries.svelte";
  import CategoryGlyph from "#lib/components/categories/CategoryGlyph.svelte";
  import CategoryProperties from "#lib/components/categories/detail/CategoryProperties.svelte";
  import SpendingChart from "#lib/components/categories/detail/SpendingChart.svelte";
  import SpendingHero from "#lib/components/categories/detail/SpendingHero.svelte";
  import DeleteTagDialog from "#lib/components/tags/DeleteTagDialog.svelte";
  import { patchTag } from "#lib/categories-client.ts";
  import { viewQuery, type DetailView } from "#lib/category-detail.ts";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  /** Query string of this page with some view state replaced. */
  const queryFor = (changes: Partial<DetailView> = {}) =>
    viewQuery(data.view, changes, data.currentMonth);
</script>

<svelte:head><title>{data.tag.name} · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex flex-col gap-2">
      <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
        <ol class="flex gap-2">
          <li><a class="anchor" href={resolve("/")}>Home</a></li>
          <li aria-hidden="true">›</li>
          <li><a class="anchor" href={resolve("/tags")}>Tags</a></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">{data.tag.id} ({data.tag.name})</li>
        </ol>
      </nav>
      <h1
        class="flex flex-wrap items-center gap-3 text-2xl font-extrabold tracking-tight"
      >
        <CategoryGlyph icon={data.tag.icon} color={data.tag.color} />
        {data.tag.name}
      </h1>
      {#if data.tag.description}
        <p class="text-sm text-surface-600-400">{data.tag.description}</p>
      {/if}
    </div>
    <DeleteTagDialog name={data.tag.name} />
  </header>

  <div class="grid gap-6 lg:grid-cols-2">
    <SpendingHero
      month={data.month}
      previousMonth={data.previousMonth}
      nextMonth={data.nextMonth}
      route="/tags/[id]"
      id={data.tag.id}
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
      route="/tags/[id]"
      id={data.tag.id}
      {queryFor}
      color={data.tag.color}
    />
  </div>

  {#key data.tag.id}
    <CategoryProperties category={data.tag} noun="Tag" patch={patchTag} />
  {/key}

  <CategoryEntries
    name={data.tag.name}
    entries={data.entries}
    total={data.total}
    view={data.view}
    route="/tags/[id]"
    id={data.tag.id}
    {queryFor}
  />
</div>
