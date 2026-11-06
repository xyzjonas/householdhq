<script lang="ts">
  import { resolve } from "$app/paths";
  import {
    formatDateWithYear,
    formatMoney,
    formatNumber,
  } from "#lib/format.ts";
  import { fallbackVehicleColor } from "#lib/vehicle-icons.ts";
  import type { VehicleDetail } from "#lib/server/core/types.ts";
  import RegistrationPlate from "../RegistrationPlate.svelte";

  let {
    vehicle,
    currency,
  }: {
    vehicle: VehicleDetail;
    currency: string;
  } = $props();

  const fullDate = (value: Date | string | null) =>
    value
      ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
          new Date(value),
        )
      : null;
</script>

{#snippet info(label: string, value: string | null)}
  <div
    class="flex min-h-20 flex-col gap-1 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
  >
    <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
      {label}
    </dt>
    <dd class="text-base font-bold break-words {value ? '' : 'opacity-50'}">
      {value ?? "Not filled in"}
    </dd>
  </div>
{/snippet}

{#snippet categoryInfo(
  label: string,
  category: { id: number; name: string } | null,
)}
  <div
    class="flex min-h-20 flex-col gap-1 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
  >
    <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
      {label}
    </dt>
    <dd class="text-base font-bold {category ? '' : 'opacity-50'}">
      {#if category}
        <a
          class="anchor"
          href={resolve("/categories/[id]", { id: String(category.id) })}
        >
          {category.name}
        </a>
      {:else}
        Not filled in
      {/if}
    </dd>
  </div>
{/snippet}

<section
  aria-labelledby="details-heading"
  class="flex flex-col gap-4 card border border-surface-200-800 p-6"
>
  <header class="flex flex-col gap-1">
    <h2 id="details-heading" class="text-lg font-bold">Vehicle details</h2>
    <p class="text-sm text-surface-600-400">
      Technical data and how the vehicle's costs are filed
    </p>
  </header>

  <dl class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {@render info("VIN", vehicle.vin)}
    <div
      class="flex min-h-20 flex-col items-start gap-1 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
    >
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        Registration
      </dt>
      <dd><RegistrationPlate value={vehicle.registration} /></dd>
    </div>
    {@render info("Model", `${vehicle.brand} ${vehicle.model}`)}
    <div
      class="flex min-h-20 flex-col gap-1 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
    >
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        Colour
      </dt>
      <dd class="flex items-center gap-2 text-base font-bold">
        <span
          class="size-5 rounded-md border border-surface-300-700"
          style:background-color={vehicle.color ?? fallbackVehicleColor}
          aria-hidden="true"
        ></span>
        {vehicle.color ?? "Default"}
      </dd>
    </div>
    {@render info(
      "Purchase price",
      vehicle.purchasePrice != null
        ? formatMoney(vehicle.purchasePrice, currency)
        : null,
    )}
    {@render info("Purchased", fullDate(vehicle.purchasedAt))}
    {@render info(
      "Mass",
      vehicle.mass != null ? formatNumber(vehicle.mass, "kg") : null,
    )}
    {@render info(
      "Engine size",
      vehicle.engineSize != null
        ? formatNumber(vehicle.engineSize, "cc")
        : null,
    )}
    {@render info("Fuel type", vehicle.fuelType)}
    {@render info(
      "Max power",
      vehicle.maxPower != null ? formatNumber(vehicle.maxPower, "kW") : null,
    )}
    {@render info(
      "Fuel transaction title",
      vehicle.defaultFuelTransactionTitle,
    )}
    {@render categoryInfo("Maintenance category", vehicle.category)}
    {@render categoryInfo("Fuel category", vehicle.fuelCategory)}
    {@render info("Date of fabrication", fullDate(vehicle.dateOfFabrication))}
    {@render info("First registered", fullDate(vehicle.dateFirstRegistered))}
    {@render info("Added", formatDateWithYear(vehicle.createdAt))}
    {@render info("Last changed", formatDateWithYear(vehicle.updatedAt))}
  </dl>
</section>
