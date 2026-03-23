<template>
  <section class="card flex flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="uppercase text-xl">{{ $t("vehicle_fuel_entries") }}</h2>
    </div>

    <ui-timeline
      v-if="vehicle.fuelEntries?.length"
      :items="vehicle.fuelEntries"
      item-key="id"
      :color="vehicle.color ?? 'var(--primary-100)'"
    >
      <template #item="{ item: entry }">
        <vehicle-fuel-listing-entry :entry="entry" />
      </template>
    </ui-timeline>

    <ui-empty
      v-else
      icon="i-ic-baseline-local-gas-station"
      :title="$t('vehicle_fuel_entries')"
      :subtitle="$t('vehicle_fuel_entries_empty')"
    />
  </section>
</template>

<script setup lang="ts">
import type { VehicleDetail } from "~/types";

defineProps<{
  vehicle: VehicleDetail;
}>();

defineEmits<{
  (e: "delete-entry", entryId: number): void;
}>();
</script>
