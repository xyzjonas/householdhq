<script lang="ts">
  import { resolve } from "$app/paths";
  import Fuel from "@lucide/svelte/icons/fuel";
  import Pencil from "@lucide/svelte/icons/pencil";
  import { formatDateTime, formatMoney, formatNumber } from "#lib/format.ts";
  import type { FuelEntry } from "#lib/server/core/types.ts";
  import FuelChart from "./FuelChart.svelte";
  import Timeline from "./Timeline.svelte";

  let {
    entries,
    color,
    currency,
    onedit,
    onadd,
  }: {
    entries: FuelEntry[];
    color: string | null;
    currency: string;
    onedit: (entry: FuelEntry) => void;
    onadd: () => void;
  } = $props();
</script>

<section
  aria-labelledby="fuel-heading"
  class="flex flex-col gap-5 card border border-surface-200-800 p-6"
>
  <header class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h2 id="fuel-heading" class="text-lg font-bold">Fuel entries</h2>
      <p class="text-sm text-surface-600-400">
        {entries.length}
        {entries.length === 1 ? "fill-up" : "fill-ups"} recorded
      </p>
    </div>
    <button
      type="button"
      class="btn rounded-full preset-tonal text-xs font-bold"
      onclick={onadd}
    >
      <Fuel size={16} aria-hidden="true" />
      <span>Add fuel</span>
    </button>
  </header>

  {#if entries.length}
    <FuelChart {entries} {color} {currency} />

    <Timeline items={entries} {color}>
      {#snippet item(entry)}
        <article
          class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-surface-200-800 p-4"
        >
          <div class="flex min-w-0 flex-col items-start gap-1">
            <h3 class="text-lg font-extrabold tracking-tight">
              {formatNumber(entry.odometer, "km")}
            </h3>
            <p class="text-sm">
              {formatNumber(entry.fuelAmount, "L")}
              <span aria-hidden="true" class="mx-1 opacity-40">|</span>
              {formatNumber(entry.unitPrice)}
              {entry.transaction.currency} / L
            </p>
            {#if entry.isFullTank}
              <span
                class="inline-flex items-center gap-1 rounded-full border border-success-500 px-2 py-0.5 text-xs font-bold text-success-600-400"
              >
                <Fuel size={12} aria-hidden="true" />
                Full tank
              </span>
            {/if}
            <time
              class="mt-1 text-xs text-surface-500"
              datetime={new Date(entry.fueledAt).toISOString()}
            >
              {formatDateTime(entry.fueledAt)}
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
              <span class="sr-only">
                fill-up at {formatNumber(entry.odometer, "km")}
              </span>
            </button>
          </div>
        </article>
      {/snippet}
    </Timeline>
  {:else}
    <p class="py-8 text-center text-sm opacity-70">
      No fuel entries yet. Add the first fill-up to see statistics.
    </p>
  {/if}
</section>
