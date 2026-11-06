<script lang="ts">
  import { resolve } from "$app/paths";
  import { formatDateWithYear, formatMoney } from "#lib/format.ts";
  import type { Vehicle } from "#lib/server/core/types.ts";
  import RegistrationPlate from "./RegistrationPlate.svelte";
  import VehicleGlyph from "./VehicleGlyph.svelte";

  let { vehicle, currency }: { vehicle: Vehicle; currency: string } = $props();

  const year = $derived(
    vehicle.dateOfFabrication
      ? new Date(vehicle.dateOfFabrication).getFullYear()
      : null,
  );
</script>

<article
  class="relative flex items-center justify-between gap-4 card border border-surface-200-800 p-5 transition-colors hover:border-surface-400-600"
>
  <div class="flex min-w-0 items-center gap-4">
    <VehicleGlyph icon={vehicle.icon} color={vehicle.color} />
    <div class="flex min-w-0 flex-col gap-1.5">
      <div class="flex min-w-0 flex-col">
        <h2 class="truncate text-base font-bold tracking-wide uppercase">
          <a
            href={resolve("/vehicles/[id]", { id: String(vehicle.id) })}
            class="after:absolute after:inset-0 hover:underline"
          >
            {vehicle.name}
          </a>
        </h2>
        <p class="text-xs text-surface-600-400">
          {vehicle.brand}
          {vehicle.model}
          {#if year}
            <span aria-hidden="true" class="mx-1.5 opacity-50">|</span>
            <strong>{year}</strong>
          {/if}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <RegistrationPlate value={vehicle.registration} />
        {#if vehicle.purchasedAt}
          <p class="text-[11px] text-surface-500">
            Purchased
            <time datetime={new Date(vehicle.purchasedAt).toISOString()}>
              {formatDateWithYear(vehicle.purchasedAt)}
            </time>
          </p>
        {/if}
      </div>
    </div>
  </div>

  {#if vehicle.purchasePrice}
    <div class="hidden shrink-0 text-right sm:block">
      <p class="text-xs font-bold tracking-wider uppercase opacity-60">
        Purchase price
      </p>
      <p class="text-xl font-extrabold">
        {formatMoney(vehicle.purchasePrice, currency)}
      </p>
    </div>
  {/if}
</article>
