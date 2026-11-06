<script lang="ts">
  import { resolve } from "$app/paths";
  import Gauge from "@lucide/svelte/icons/gauge";
  import MeterDialog from "#lib/components/energy/MeterDialog.svelte";
  import MeterRow from "#lib/components/energy/MeterRow.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Energy · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-8">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex flex-col gap-2">
      <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
        <ol class="flex gap-2">
          <li><a class="anchor" href={resolve("/")}>Home</a></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Energy ({data.meters.length} meters)</li>
        </ol>
      </nav>
      <h1 class="text-2xl font-extrabold tracking-tight">
        Utility meters & readings
      </h1>
    </div>
    <MeterDialog message={form?.message} />
  </header>

  <ul
    aria-label="Meters"
    class="flex flex-col overflow-hidden card border border-surface-200-800"
  >
    {#each data.meters as meter (meter.id)}
      <MeterRow {meter} />
    {:else}
      <li class="flex flex-col items-center gap-2 p-10 text-center">
        <Gauge size={32} class="opacity-40" aria-hidden="true" />
        <h2 class="text-lg font-bold">No meters yet</h2>
        <p class="text-sm text-surface-600-400">
          Add your first meter to start tracking readings.
        </p>
      </li>
    {/each}
  </ul>
</div>
