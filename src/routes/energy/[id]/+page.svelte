<script lang="ts">
  import { resolve } from "$app/paths";
  import EnergyChart from "#lib/components/energy/EnergyChart.svelte";
  import MeterDialog from "#lib/components/energy/MeterDialog.svelte";
  import MeterGlyph from "#lib/components/energy/MeterGlyph.svelte";
  import ReadingDialog from "#lib/components/energy/ReadingDialog.svelte";
  import ReadingsTimeline from "#lib/components/energy/ReadingsTimeline.svelte";
  import { formatReading } from "#lib/energy.ts";
  import { meterFallbackColor } from "#lib/meter-icons.ts";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  const meter = $derived(data.meter);
  const latest = $derived(meter.readings[0]);
  const color = $derived(meter.color ?? meterFallbackColor);
  const updated = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
</script>

<svelte:head><title>{meter.name} · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex min-w-0 flex-col gap-2">
      <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
        <ol class="flex gap-2">
          <li><a class="anchor" href={resolve("/")}>Home</a></li>
          <li aria-hidden="true">›</li>
          <li><a class="anchor" href={resolve("/energy")}>Energy</a></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">{meter.id} ({meter.name})</li>
        </ol>
      </nav>
      <h1
        class="flex flex-wrap items-center gap-3 text-2xl font-extrabold tracking-tight"
      >
        <MeterGlyph icon={meter.icon} {color} large />
        <span class="truncate">{meter.name}</span>
      </h1>
      <p class="text-sm text-surface-600-400">
        Unit: {meter.unit}
        {#if meter.meterNumber}· Meter ID: {meter.meterNumber}{/if}
        · {meter.readings.length}
        {meter.readings.length === 1 ? "reading" : "readings"}
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
    <section
      aria-labelledby="latest-heading"
      class="flex flex-col justify-between gap-6 card border border-surface-200-800 p-6"
    >
      <div class="flex flex-col gap-2">
        <h2
          id="latest-heading"
          class="text-xs font-bold tracking-wider uppercase opacity-60"
        >
          Latest reading
        </h2>
        <p class="text-4xl font-extrabold tracking-tight">
          {latest ? formatReading(latest.value, meter.unit) : "—"}
        </p>
      </div>
      <dl
        class="grid grid-cols-2 gap-3 border-t border-surface-200-800 pt-4 text-sm"
      >
        <div class="flex flex-col gap-1">
          <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
            Last updated
          </dt>
          <dd class="font-bold">
            {latest ? updated.format(latest.meteredAt) : "—"}
          </dd>
        </div>
        <div class="flex flex-col gap-1">
          <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
            Readings
          </dt>
          <dd class="font-bold">{meter.readings.length}</dd>
        </div>
      </dl>
    </section>

    <EnergyChart
      readings={meter.readings}
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
      <h2 id="readings-heading" class="text-lg font-bold">Readings</h2>
      <p class="text-sm text-surface-600-400">
        Each reading stays on its own timeline for this meter.
      </p>
    </header>
    {#if meter.readings.length}
      <ReadingsTimeline readings={meter.readings} unit={meter.unit} {color} />
    {:else}
      <p class="py-6 text-center text-sm opacity-70">
        Add the first reading for this meter to populate the timeline.
      </p>
    {/if}
  </section>
</div>
