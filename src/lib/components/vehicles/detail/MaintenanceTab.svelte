<script lang="ts">
  import { resolve } from "$app/paths";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Wrench from "@lucide/svelte/icons/wrench";
  import { readableTextOn } from "#lib/color.ts";
  import { formatDateTime, formatMoney, formatNumber } from "#lib/format.ts";
  import { serviceTypeLabels } from "#lib/vehicle-service.ts";
  import type { ServiceEntry } from "#lib/server/core/types.ts";
  import ComponentChip from "../ComponentChip.svelte";
  import Timeline from "./Timeline.svelte";

  let {
    entries,
    color,
    onedit,
    onadd,
  }: {
    entries: ServiceEntry[];
    color: string | null;
    onedit: (entry: ServiceEntry) => void;
    onadd: () => void;
  } = $props();

  let selected = $state<number[]>([]);

  /** Every component any service touched, by name. */
  const components = $derived(
    entries
      .flatMap((e) => e.components)
      .filter((c, i, all) => all.findIndex((o) => o.id === c.id) === i)
      .sort((a, b) => a.name.localeCompare(b.name)),
  );

  // Services touching any of the selected components; all without a selection.
  const visible = $derived(
    selected.length
      ? entries.filter((e) => e.components.some((c) => selected.includes(c.id)))
      : entries,
  );
</script>

<section
  aria-labelledby="service-heading"
  class="flex flex-col gap-5 card border border-surface-200-800 p-6"
>
  <header class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h2 id="service-heading" class="text-lg font-bold">Maintenance</h2>
      <p class="text-sm text-surface-600-400">
        {entries.length}
        {entries.length === 1 ? "service" : "services"} recorded
      </p>
    </div>
    <button
      type="button"
      class="btn rounded-full preset-tonal text-xs font-bold"
      onclick={onadd}
    >
      <Wrench size={16} aria-hidden="true" />
      <span>Add service</span>
    </button>
  </header>

  {#if components.length}
    <fieldset class="flex flex-wrap gap-1.5">
      <legend class="sr-only">Filter by component</legend>
      {#each components as c (c.id)}
        <label
          class="cursor-pointer rounded-full border border-surface-300-700 bg-surface-100-900 px-3 py-1 text-xs font-semibold transition-shadow has-checked:ring-2 has-checked:ring-offset-1 has-focus-visible:outline-2"
          style:background-color={c.color}
          style:border-color={c.color}
          style:color={c.color ? readableTextOn(c.color) : undefined}
        >
          <input
            type="checkbox"
            class="sr-only"
            value={c.id}
            bind:group={selected}
          />
          {c.name}
        </label>
      {/each}
    </fieldset>
  {/if}

  {#if visible.length}
    <Timeline items={visible} {color}>
      {#snippet item(entry)}
        <article
          class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-surface-200-800 p-4"
        >
          <div class="flex min-w-0 flex-col items-start gap-1">
            <h3 class="text-base font-bold capitalize">{entry.title}</h3>
            <p class="text-sm text-surface-600-400">
              {serviceTypeLabels[entry.type]}
              {#if entry.odometer}
                · {formatNumber(entry.odometer, "km")}
              {/if}
            </p>
            {#if entry.description}
              <p class="line-clamp-2 text-xs text-surface-500">
                {entry.description}
              </p>
            {/if}
            {#if entry.components.length}
              <ul class="mt-1 flex flex-wrap gap-1" aria-label="Components">
                {#each entry.components as c (c.id)}
                  <li><ComponentChip name={c.name} color={c.color} /></li>
                {/each}
              </ul>
            {/if}
            <time
              class="mt-1 text-xs text-surface-500"
              datetime={new Date(entry.servicedAt).toISOString()}
            >
              {formatDateTime(entry.servicedAt)}
            </time>
          </div>

          <div class="ml-auto flex flex-col items-end gap-1 text-right">
            <p class="text-lg font-extrabold">
              {formatMoney(
                entry.transaction.amount,
                entry.transaction.currency,
              )}
            </p>
            <a
              class="max-w-48 truncate anchor text-xs"
              href={resolve("/transactions/[id]/edit", {
                id: String(entry.transactionId),
              })}
            >
              {entry.transaction.description}
            </a>
            <button
              type="button"
              class="mt-2 btn rounded-full preset-tonal text-xs"
              onclick={() => onedit(entry)}
            >
              <Pencil size={14} aria-hidden="true" />
              <span>Edit</span>
              <span class="sr-only">{entry.title}</span>
            </button>
          </div>
        </article>
      {/snippet}
    </Timeline>
  {:else}
    <p class="py-8 text-center text-sm opacity-70">
      {entries.length
        ? "No services touched the selected components."
        : "No services recorded yet."}
    </p>
  {/if}
</section>
