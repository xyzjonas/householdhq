<script lang="ts">
  import { resolve } from "$app/paths";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import { formatReading } from "#lib/energy.ts";
  import { formatDateWithYear } from "#lib/format.ts";
  import type { MeterWithReadings } from "#lib/server/core/types.ts";
  import MeterGlyph from "./MeterGlyph.svelte";

  let { meter }: { meter: MeterWithReadings } = $props();

  const latest = $derived(meter.readings[0]);
</script>

<li
  class="border-b border-surface-200-800 transition-colors duration-150 last:border-b-0 hover:bg-surface-500/10"
>
  <a
    href={resolve("/energy/[id]", { id: String(meter.id) })}
    class="flex items-center justify-between gap-4 px-4 py-3"
  >
    <span class="flex min-w-0 items-center gap-3">
      <MeterGlyph icon={meter.icon} color={meter.color} />
      <span class="flex min-w-0 flex-col">
        <span class="truncate font-bold">{meter.name}</span>
        <span class="truncate text-xs text-surface-600-400">
          {meter.readings.length}
          {meter.readings.length === 1 ? "reading" : "readings"}
          {#if meter.meterNumber}· ID {meter.meterNumber}{/if}
          {#if latest}· {formatDateWithYear(latest.meteredAt)}{/if}
        </span>
      </span>
    </span>
    <span class="flex shrink-0 items-center gap-2">
      <span class="flex flex-col items-end">
        <span
          class="text-xs font-bold tracking-wider uppercase opacity-60 max-sm:sr-only"
        >
          Latest
        </span>
        <span class="font-bold">
          {latest ? formatReading(latest.value, meter.unit) : "—"}
        </span>
      </span>
      <ChevronRight size={18} class="opacity-50" aria-hidden="true" />
    </span>
  </a>
</li>
