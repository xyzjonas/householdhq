<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { intlLocale } from "#lib/i18n.ts";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { formatReading, incrementById } from "#lib/energy.ts";
  import type { MeterReading } from "#lib/server/core/types.ts";
  import DeleteReadingDialog from "./DeleteReadingDialog.svelte";

  let {
    readings,
    unit,
    color,
  }: {
    /** Newest first. */
    readings: MeterReading[];
    unit: string;
    color: string;
  } = $props();

  const increments = $derived(incrementById(readings));
  const dateFmt = $derived(
    new Intl.DateTimeFormat(intlLocale(), {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  );

  let pending = $state<{ id: number; label: string } | null>(null);
</script>

<ol class="flex flex-col" style="--meter: {color}">
  {#each readings as reading (reading.id)}
    {@const increment = increments.get(reading.id)}
    <li
      class="relative flex items-center justify-between gap-3 border-l-2 border-surface-200-800 py-2 pl-5"
    >
      <span
        class="dot absolute top-1/2 -left-[0.4rem] size-3 -translate-y-1/2 rounded-full ring-4 ring-surface-50-950"
        aria-hidden="true"
      ></span>
      <time
        class="text-sm text-surface-600-400"
        datetime={reading.meteredAt.toISOString()}
      >
        {dateFmt.format(reading.meteredAt)}
      </time>
      <span class="flex items-center gap-3">
        <span class="flex flex-col items-end">
          <span class="font-bold">{formatReading(reading.value, unit)}</span>
          {#if increment}
            <span class="text-xs text-surface-600-400">
              +{formatReading(increment, unit)}
            </span>
          {/if}
        </span>
        <button
          type="button"
          class="btn-icon preset-tonal btn-icon-sm"
          aria-label={m.energy_delete_reading({
            date: dateFmt.format(reading.meteredAt),
          })}
          onclick={() =>
            (pending = {
              id: reading.id,
              label: dateFmt.format(reading.meteredAt),
            })}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </span>
    </li>
  {/each}
</ol>

<DeleteReadingDialog bind:reading={pending} />

<style scoped>
  .dot {
    background-color: var(--meter);
  }
</style>
