<script lang="ts">
  import { resolve } from "$app/paths";
  import { Tabs } from "@skeletonlabs/skeleton-svelte";
  import Fuel from "@lucide/svelte/icons/fuel";
  import Info from "@lucide/svelte/icons/info";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Receipt from "@lucide/svelte/icons/receipt";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import Wrench from "@lucide/svelte/icons/wrench";
  import TransactionList from "#lib/components/TransactionList.svelte";
  import RegistrationPlate from "#lib/components/vehicles/RegistrationPlate.svelte";
  import VehicleDialog from "#lib/components/vehicles/VehicleDialog.svelte";
  import VehicleGlyph from "#lib/components/vehicles/VehicleGlyph.svelte";
  import DeleteDialog, {
    type DeleteTarget,
  } from "#lib/components/vehicles/detail/DeleteDialog.svelte";
  import DetailsTab from "#lib/components/vehicles/detail/DetailsTab.svelte";
  import FuelEntryDialog from "#lib/components/vehicles/detail/FuelEntryDialog.svelte";
  import FuelTab from "#lib/components/vehicles/detail/FuelTab.svelte";
  import MaintenanceTab from "#lib/components/vehicles/detail/MaintenanceTab.svelte";
  import ServiceEntryDialog from "#lib/components/vehicles/detail/ServiceEntryDialog.svelte";
  import { formatNumber } from "#lib/format.ts";
  import type { FuelEntry, ServiceEntry } from "#lib/server/core/types.ts";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const tabs = [
    { id: "fuel", label: "Fuel", icon: Fuel },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "transactions", label: "Transactions", icon: Receipt },
    { id: "details", label: "Details", icon: Info },
  ] as const;
  let tab = $state<(typeof tabs)[number]["id"]>("fuel");

  let editingVehicle = $state(false);
  let fuelOpen = $state(false);
  let fuelEntry = $state<FuelEntry | null>(null);
  let serviceOpen = $state(false);
  let serviceEntry = $state<ServiceEntry | null>(null);
  let deleting = $state<DeleteTarget | null>(null);

  const vehicle = $derived(data.vehicle);

  function addFuel() {
    fuelEntry = null;
    fuelOpen = true;
  }
  function editFuel(entry: FuelEntry) {
    fuelEntry = entry;
    fuelOpen = true;
  }
  function addService() {
    serviceEntry = null;
    serviceOpen = true;
  }
  function editService(entry: ServiceEntry) {
    serviceEntry = entry;
    serviceOpen = true;
  }

  function deleteFuel(entry: FuelEntry) {
    deleting = {
      action: "?/deleteFuel",
      id: entry.id,
      title: "Delete fill-up?",
      description: `The fill-up at ${formatNumber(entry.odometer, "km")} and its transaction “${entry.transaction.description}” will be permanently removed.`,
      done: "Fill-up deleted",
    };
  }
  function deleteService(entry: ServiceEntry) {
    deleting = {
      action: "?/deleteService",
      id: entry.id,
      title: "Delete service?",
      description: `“${entry.title}” and its transaction will be permanently removed.`,
      done: "Service deleted",
    };
  }
  function deleteVehicle() {
    const fills = vehicle.fuelEntries.length;
    const services = vehicle.serviceEntries.length;
    deleting = {
      action: "?/deleteVehicle",
      title: `Delete ${vehicle.name}?`,
      description:
        fills + services
          ? `The vehicle, its ${fills} fuel ${fills === 1 ? "entry" : "entries"} and ${services} ${services === 1 ? "service" : "services"} will be permanently removed, together with their transactions.`
          : "The vehicle will be permanently removed.",
      done: "Vehicle deleted",
    };
  }
</script>

<svelte:head><title>{vehicle.name} · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <header class="flex flex-col gap-4">
    <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
      <ol class="flex gap-2">
        <li><a class="anchor" href={resolve("/")}>Home</a></li>
        <li aria-hidden="true">›</li>
        <li><a class="anchor" href={resolve("/vehicles")}>Vehicles</a></li>
        <li aria-hidden="true">›</li>
        <li aria-current="page" class="min-w-0 wrap-anywhere">
          {vehicle.id} ({vehicle.name})
        </li>
      </ol>
    </nav>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex min-w-0 items-center gap-4">
        <VehicleGlyph icon={vehicle.icon} color={vehicle.color} large />
        <div class="flex min-w-0 flex-col gap-1.5">
          <h1 class="truncate text-2xl font-extrabold tracking-tight uppercase">
            {vehicle.name}
          </h1>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="badge max-w-full preset-tonal text-[11px] font-bold wrap-anywhere whitespace-normal"
            >
              {vehicle.brand}
              {vehicle.model}
            </span>
            <RegistrationPlate value={vehicle.registration} />
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="btn rounded-full preset-tonal text-xs font-bold"
          onclick={() => (editingVehicle = true)}
        >
          <Pencil size={16} aria-hidden="true" />
          <span>Edit</span>
        </button>
        <button
          type="button"
          class="btn rounded-full preset-tonal text-xs font-bold hover:preset-tonal-error"
          onclick={deleteVehicle}
        >
          <Trash2 size={16} aria-hidden="true" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  </header>

  <Tabs value={tab} onValueChange={(e) => (tab = e.value as typeof tab)}>
    <Tabs.List
      class="flex gap-2 overflow-x-auto border-0 lg:mb-0! lg:border-b-0! lg:pb-0!"
    >
      {#each tabs as t (t.id)}
        <Tabs.Trigger
          value={t.id}
          class="btn min-h-12 rounded-full text-xs font-semibold whitespace-nowrap lg:min-h-0 {tab ===
          t.id
            ? 'preset-filled-surface-950-50'
            : 'border border-surface-200-800 preset-filled-surface-50-950'}"
        >
          <t.icon size={16} aria-hidden="true" />
          <span>{t.label}</span>
        </Tabs.Trigger>
      {/each}
    </Tabs.List>

    <Tabs.Content value="fuel" class="mt-4">
      <FuelTab
        entries={vehicle.fuelEntries}
        color={vehicle.color}
        currency={data.currency}
        onedit={editFuel}
        onadd={addFuel}
      />
    </Tabs.Content>
    <Tabs.Content value="maintenance" class="mt-4">
      <MaintenanceTab
        entries={vehicle.serviceEntries}
        color={vehicle.color}
        onedit={editService}
        onadd={addService}
      />
    </Tabs.Content>
    <Tabs.Content value="transactions" class="mt-4">
      <section
        aria-labelledby="transactions-heading"
        class="flex flex-col gap-4"
      >
        <header class="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 id="transactions-heading" class="text-lg font-bold">
              Transactions
            </h2>
            <p class="text-sm text-surface-600-400">
              {#if vehicle.category}
                Filed under {vehicle.category.name}
              {:else}
                Choose a maintenance category in the vehicle's settings to see
                its transactions here.
              {/if}
            </p>
          </div>
          {#if vehicle.category && data.transactionTotal > data.transactions.length}
            <a
              class="anchor text-sm"
              href={resolve("/categories/[id]", {
                id: String(vehicle.category.id),
              })}
            >
              Showing {data.transactions.length} of {data.transactionTotal} · view
              all
            </a>
          {/if}
        </header>
        <TransactionList
          transactions={data.transactions}
          empty="No transactions in this category yet."
        />
      </section>
    </Tabs.Content>
    <Tabs.Content value="details" class="mt-4">
      <DetailsTab {vehicle} currency={data.currency} />
    </Tabs.Content>
  </Tabs>
</div>

<VehicleDialog
  bind:open={editingVehicle}
  {vehicle}
  categories={data.categories}
  action="?/vehicle"
/>
<FuelEntryDialog
  bind:open={fuelOpen}
  entry={fuelEntry}
  entries={vehicle.fuelEntries}
  ondelete={deleteFuel}
/>
<ServiceEntryDialog
  bind:open={serviceOpen}
  entry={serviceEntry}
  components={data.components}
  ondelete={deleteService}
/>
<DeleteDialog bind:target={deleting} />
