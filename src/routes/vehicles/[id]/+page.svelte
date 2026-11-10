<script lang="ts">
  import { m } from "#paraglide/messages.js";
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
    { id: "fuel", label: () => m.vehicles_tab_fuel(), icon: Fuel },
    {
      id: "maintenance",
      label: () => m.vehicles_tab_maintenance(),
      icon: Wrench,
    },
    {
      id: "transactions",
      label: () => m.vehicles_tab_transactions(),
      icon: Receipt,
    },
    { id: "details", label: () => m.vehicles_tab_details(), icon: Info },
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
      title: m.vehicles_delete_fuel_title(),
      description: m.vehicles_delete_fuel_description({
        odometer: formatNumber(entry.odometer, "km"),
        description: entry.transaction.description,
      }),
      done: m.vehicles_delete_fuel_done(),
    };
  }
  function deleteService(entry: ServiceEntry) {
    deleting = {
      action: "?/deleteService",
      id: entry.id,
      title: m.vehicles_delete_service_title(),
      description: m.vehicles_delete_service_description({
        title: entry.title,
      }),
      done: m.vehicles_delete_service_done(),
    };
  }
  function deleteVehicle() {
    const fills = vehicle.fuelEntries.length;
    const services = vehicle.serviceEntries.length;
    deleting = {
      action: "?/deleteVehicle",
      title: m.vehicles_delete_vehicle_title({ name: vehicle.name }),
      description:
        fills + services
          ? m.vehicles_delete_vehicle_description_with_entries({
              fuel: m.vehicles_delete_fuel_entries_count({ count: fills }),
              services: m.vehicles_delete_services_count({ count: services }),
            })
          : m.vehicles_delete_vehicle_description(),
      done: m.vehicles_delete_vehicle_done(),
    };
  }
</script>

<svelte:head
  ><title
    >{m.vehicles_detail_title({
      name: vehicle.name,
      appName: m.common_app_name(),
    })}</title
  ></svelte:head
>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <header class="flex flex-col gap-4">
    <nav
      aria-label={m.vehicles_breadcrumb_label()}
      class="text-sm text-surface-600-400"
    >
      <ol class="flex gap-2">
        <li>
          <a class="anchor" href={resolve("/")}
            >{m.vehicles_breadcrumb_home()}</a
          >
        </li>
        <li aria-hidden="true">›</li>
        <li>
          <a class="anchor" href={resolve("/vehicles")}
            >{m.vehicles_list_heading()}</a
          >
        </li>
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
          <span>{m.common_edit()}</span>
        </button>
        <button
          type="button"
          class="btn rounded-full preset-tonal text-xs font-bold hover:preset-tonal-error"
          onclick={deleteVehicle}
        >
          <Trash2 size={16} aria-hidden="true" />
          <span>{m.common_delete()}</span>
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
          <span>{t.label()}</span>
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
              {m.vehicles_tab_transactions()}
            </h2>
            <p class="text-sm text-surface-600-400">
              {#if vehicle.category}
                {m.vehicles_transactions_filed_under({
                  category: vehicle.category.name,
                })}
              {:else}
                {m.vehicles_transactions_choose_category()}
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
              {m.vehicles_transactions_showing({
                shown: data.transactions.length,
                total: data.transactionTotal,
              })}
            </a>
          {/if}
        </header>
        <TransactionList
          transactions={data.transactions}
          empty={m.vehicles_transactions_empty()}
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
