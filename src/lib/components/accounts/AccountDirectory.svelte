<script lang="ts">
  import { Tabs } from "@skeletonlabs/skeleton-svelte";
  import Search from "@lucide/svelte/icons/search";
  import {
    buildSections,
    countForTab,
    orderSections,
    sortOptions,
    tabs,
    type SortId,
    type TabId,
  } from "#lib/accounts-view.ts";
  import { formatMoney } from "#lib/format.ts";
  import type { AccountWithBalance } from "#lib/server/core/types.ts";
  import AccountRow from "./AccountRow.svelte";

  let { accounts }: { accounts: AccountWithBalance[] } = $props();

  let tab = $state<TabId>("all");
  let sort = $state<SortId>("position");
  let query = $state("");

  const sections = $derived(
    orderSections(buildSections(accounts, { tab, sort, query }), sort),
  );
</script>

<section aria-labelledby="directory-heading" class="flex flex-col gap-5">
  <h2 id="directory-heading" class="sr-only">Account directory</h2>

  <Tabs value={tab} onValueChange={(e) => (tab = e.value as TabId)}>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <Tabs.List
        class="flex gap-2 overflow-x-auto border-0 lg:mb-0! lg:border-b-0! lg:pb-0!"
      >
        {#each tabs as t (t.id)}
          <Tabs.Trigger
            value={t.id}
            class="btn text-xs font-semibold {tab === t.id
              ? 'preset-filled-surface-950-50'
              : 'border border-surface-200-800 preset-filled-surface-50-950'}"
          >
            {t.label} ({countForTab(accounts, t.id)})
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
            placeholder="Filter by name"
            aria-label="Filter accounts by name"
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

    {#each tabs as t (t.id)}
      <Tabs.Content value={t.id} class="flex flex-col gap-8 pt-4">
        {#if t.id === tab}
          {#each sections as section (section.group.type)}
            <section
              aria-labelledby="group-{section.group.type}"
              class="flex flex-col gap-3"
            >
              <header class="flex items-baseline justify-between gap-3">
                <h3 id="group-{section.group.type}" class="text-lg font-bold">
                  {section.group.title}
                </h3>
                <p class="text-sm text-surface-600-400">
                  Total: {formatMoney(section.total)}
                </p>
              </header>
              <ul class="flex flex-col gap-3">
                {#each section.accounts as account (account.id)}
                  <li><AccountRow {account} /></li>
                {/each}
              </ul>
            </section>
          {:else}
            <p class="text-sm opacity-70">No accounts found.</p>
          {/each}
        {/if}
      </Tabs.Content>
    {/each}
  </Tabs>
</section>
