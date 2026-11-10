<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { resolve } from "$app/paths";
  import EnergyChart from "#lib/components/energy/EnergyChart.svelte";
  import MeterDialog from "#lib/components/energy/MeterDialog.svelte";
  import MeterStats from "#lib/components/energy/MeterStats.svelte";
  import MeterGlyph from "#lib/components/energy/MeterGlyph.svelte";
  import ReadingDialog from "#lib/components/energy/ReadingDialog.svelte";
  import ReadingsTimeline from "#lib/components/energy/ReadingsTimeline.svelte";
  import { meterFallbackColor } from "#lib/meter-icons.ts";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  const meter = $derived(data.meter);
  const color = $derived(meter.color ?? meterFallbackColor);
</script>

<svelte:head
  ><title
    >{m.energy_meter_page_title({
      name: meter.name,
      app: m.common_app_name(),
    })}</title
  ></svelte:head
>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex min-w-0 flex-col gap-2">
      <nav
        aria-label={m.energy_breadcrumb()}
        class="text-sm text-surface-600-400"
      >
        <ol class="flex gap-2">
          <li><a class="anchor" href={resolve("/")}>{m.energy_home()}</a></li>
          <li aria-hidden="true">›</li>
          <li>
            <a class="anchor" href={resolve("/energy")}>{m.energy_title()}</a>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" class="min-w-0 wrap-anywhere">
            {meter.id} ({meter.name})
          </li>
        </ol>
      </nav>
      <h1
        class="flex flex-wrap items-center gap-3 text-2xl font-extrabold tracking-tight"
      >
        <MeterGlyph icon={meter.icon} {color} large />
        <span class="truncate">{meter.name}</span>
      </h1>
      <p class="text-sm text-surface-600-400">
        {m.energy_meter_unit({ unit: meter.unit })}
        {#if meter.meterNumber}· {m.energy_meter_id({
            id: meter.meterNumber,
          })}{/if}
        · {m.energy_readings_count({ count: meter.readings.length })}
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <MeterDialog {meter} message={form?.message} />
      <ReadingDialog
        meterName={meter.name}
        unit={meter.unit}
        message={form?.message}
      />
    </div>
  </header>

  <div class="grid gap-6 lg:grid-cols-2">
    <MeterStats
      latest={meter.readings[0]}
      stats={data.stats}
      unit={meter.unit}
    />
    <EnergyChart
      readings={meter.readings}
      months={data.months}
      unit={meter.unit}
      {color}
      mode={data.mode}
      meterId={meter.id}
    />
  </div>

  <section
    aria-labelledby="readings-heading"
    class="flex flex-col gap-4 card border border-surface-200-800 p-6"
  >
    <header class="flex flex-col gap-1">
      <h2 id="readings-heading" class="text-lg font-bold">
        {m.energy_readings_title()}
      </h2>
      <p class="text-sm text-surface-600-400">
        {m.energy_readings_hint()}
      </p>
    </header>
    {#if meter.readings.length}
      <ReadingsTimeline readings={meter.readings} unit={meter.unit} {color} />
    {:else}
      <p class="py-6 text-center text-sm opacity-70">
        {m.energy_readings_empty()}
      </p>
    {/if}
  </section>
</div>
