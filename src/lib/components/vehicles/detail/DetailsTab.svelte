<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { resolve } from "$app/paths";
  import { intlLocale } from "#lib/i18n.ts";
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
      ? new Intl.DateTimeFormat(intlLocale(), { dateStyle: "medium" }).format(
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
      {value ?? m.vehicles_details_not_filled()}
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
        {m.vehicles_details_not_filled()}
      {/if}
    </dd>
  </div>
{/snippet}

<section
  aria-labelledby="details-heading"
  class="flex flex-col gap-4 card border border-surface-200-800 p-6"
>
  <header class="flex flex-col gap-1">
    <h2 id="details-heading" class="text-lg font-bold">
      {m.vehicles_details_heading()}
    </h2>
    <p class="text-sm text-surface-600-400">
      {m.vehicles_details_subtitle()}
    </p>
  </header>

  <dl class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {@render info(m.vehicles_field_vin(), vehicle.vin)}
    <div
      class="flex min-h-20 flex-col items-start gap-1 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
    >
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        {m.vehicles_field_registration()}
      </dt>
      <dd><RegistrationPlate value={vehicle.registration} /></dd>
    </div>
    {@render info(
      m.vehicles_field_model(),
      `${vehicle.brand} ${vehicle.model}`,
    )}
    <div
      class="flex min-h-20 flex-col gap-1 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
    >
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        {m.vehicles_field_colour()}
      </dt>
      <dd class="flex items-center gap-2 text-base font-bold">
        <span
          class="size-5 rounded-md border border-surface-300-700"
          style:background-color={vehicle.color ?? fallbackVehicleColor}
          aria-hidden="true"
        ></span>
        {vehicle.color ?? m.vehicles_details_default()}
      </dd>
    </div>
    {@render info(
      m.vehicles_field_purchase_price(),
      vehicle.purchasePrice != null
        ? formatMoney(vehicle.purchasePrice, currency)
        : null,
    )}
    {@render info(m.vehicles_field_purchased(), fullDate(vehicle.purchasedAt))}
    {@render info(
      m.vehicles_field_mass(),
      vehicle.mass != null ? formatNumber(vehicle.mass, "kg") : null,
    )}
    {@render info(
      m.vehicles_field_engine_size(),
      vehicle.engineSize != null
        ? formatNumber(vehicle.engineSize, m.vehicles_unit_cc())
        : null,
    )}
    {@render info(m.vehicles_field_fuel_type(), vehicle.fuelType)}
    {@render info(
      m.vehicles_field_max_power(),
      vehicle.maxPower != null ? formatNumber(vehicle.maxPower, "kW") : null,
    )}
    {@render info(
      m.vehicles_field_fuel_transaction_title(),
      vehicle.defaultFuelTransactionTitle,
    )}
    {@render categoryInfo(
      m.vehicles_field_maintenance_category(),
      vehicle.category,
    )}
    {@render categoryInfo(
      m.vehicles_field_fuel_category(),
      vehicle.fuelCategory,
    )}
    {@render info(
      m.vehicles_field_date_of_fabrication(),
      fullDate(vehicle.dateOfFabrication),
    )}
    {@render info(
      m.vehicles_field_first_registered(),
      fullDate(vehicle.dateFirstRegistered),
    )}
    {@render info(
      m.vehicles_details_added(),
      formatDateWithYear(vehicle.createdAt),
    )}
    {@render info(
      m.vehicles_details_last_changed(),
      formatDateWithYear(vehicle.updatedAt),
    )}
  </dl>
</section>
