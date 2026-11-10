<script lang="ts">
  import { resolve } from "$app/paths";
  import { m } from "#paraglide/messages.js";
  import BurnConcentration from "#lib/components/categories/BurnConcentration.svelte";
  import CreateCategoryDialog from "#lib/components/categories/CreateCategoryDialog.svelte";
  import CategoriesDirectory from "#lib/components/categories/CategoriesDirectory.svelte";
  import CategoryCards from "#lib/components/categories/CategoryCards.svelte";
  import CategoryTable from "#lib/components/categories/CategoryTable.svelte";
  import MonthSwitcher from "#lib/components/categories/MonthSwitcher.svelte";
  import RunRateCard from "#lib/components/categories/RunRateCard.svelte";
  import UnbudgetedAdvisory from "#lib/components/categories/UnbudgetedAdvisory.svelte";
  import {
    buildItems,
    burnConcentration,
    monthLabel,
    runRate,
    unbudgeted,
  } from "#lib/categories-view.ts";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  // Budgeting is not implemented in the backend yet: no category has one.
  const items = $derived(buildItems(data.categories));
  const label = $derived(monthLabel(data.month));
</script>

<svelte:head
  ><title>
    {m.categories_page_title({ app: m.common_app_name() })}
  </title></svelte:head
>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex flex-col gap-2">
      <nav
        aria-label={m.categories_breadcrumb_label()}
        class="text-sm text-surface-600-400"
      >
        <ol class="flex gap-2">
          <li>
            <a class="anchor" href={resolve("/")}
              >{m.categories_breadcrumb_home()}</a
            >
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">
            {m.categories_breadcrumb_current({ count: items.length })}
          </li>
        </ol>
      </nav>
      <h1 class="text-2xl font-extrabold tracking-tight">
        {m.categories_heading()}
      </h1>
      <p class="text-sm text-surface-600-400">
        {m.categories_ledger_subtitle({ month: label })}
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <MonthSwitcher
        month={data.month}
        previous={data.previousMonth}
        next={data.nextMonth}
      />
      <CreateCategoryDialog message={form?.message} />
    </div>
  </header>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
    <div class="flex min-w-0 flex-col gap-6">
      <div class="lg:hidden">
        <RunRateCard rate={runRate(items)} monthLabel={label} />
      </div>
      <CategoriesDirectory {items}>
        {#snippet children(visible)}
          <CategoryTable items={visible} monthLabel={label} />
          <CategoryCards items={visible} />
        {/snippet}
      </CategoriesDirectory>
    </div>
    <aside
      aria-label={m.categories_insights_label()}
      class="flex flex-col gap-6"
    >
      <BurnConcentration slices={burnConcentration(items)} />
      <UnbudgetedAdvisory items={unbudgeted(items)} />
    </aside>
  </div>
</div>
