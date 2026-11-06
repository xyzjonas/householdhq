<script lang="ts">
  import { resolve } from "$app/paths";
  import Car from "@lucide/svelte/icons/car";
  import Plus from "@lucide/svelte/icons/plus";
  import VehicleDialog from "#lib/components/vehicles/VehicleDialog.svelte";
  import VehicleRow from "#lib/components/vehicles/VehicleRow.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  let creating = $state(false);
</script>

<svelte:head><title>Vehicles · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex flex-col gap-2">
      <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
        <ol class="flex gap-2">
          <li><a class="anchor" href={resolve("/")}>Home</a></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Vehicles ({data.vehicles.length} total)</li>
        </ol>
      </nav>
      <h1 class="text-2xl font-extrabold tracking-tight">Vehicles</h1>
      <p class="text-sm text-surface-600-400">
        Fuel, maintenance and running costs of every vehicle in the household
      </p>
    </div>
    <button
      type="button"
      class="btn preset-filled-surface-950-50"
      onclick={() => (creating = true)}
    >
      <Plus size={16} aria-hidden="true" />
      <span>New vehicle</span>
    </button>
  </header>

  {#if data.vehicles.length}
    <ul class="flex flex-col gap-3">
      {#each data.vehicles as vehicle (vehicle.id)}
        <li><VehicleRow {vehicle} currency={data.currency} /></li>
      {/each}
    </ul>
  {:else}
    <section
      class="flex flex-col items-center gap-3 card border border-surface-200-800 p-10 text-center"
    >
      <Car size={40} class="opacity-40" aria-hidden="true" />
      <h2 class="text-lg font-bold">No vehicles yet</h2>
      <p class="max-w-sm text-sm text-surface-600-400">
        Add your first vehicle to start tracking its fuel and maintenance.
      </p>
    </section>
  {/if}
</div>

<VehicleDialog
  bind:open={creating}
  categories={data.categories}
  action="?/create"
/>
