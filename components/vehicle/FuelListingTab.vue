<template>
  <section class="card flex flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="uppercase text-xl">{{ $t("vehicle_fuel_entries") }}</h2>
    </div>

    <template v-if="vehicle.fuelEntries?.length">
      <vehicle-fuel-chart
        :entries="vehicle.fuelEntries"
        :color="vehicle.color ?? 'var(--primary-100)'"
      />

      <ui-timeline
        :items="vehicle.fuelEntries"
        item-key="id"
        :color="vehicle.color ?? 'var(--primary-100)'"
      >
        <template #item="{ item: entry }">
          <vehicle-fuel-listing-entry
            :entry="entry"
            @edit-entry="$emit('edit-entry', $event)"
            @delete-entry="$emit('delete-entry', $event)"
          />
        </template>
      </ui-timeline>
    </template>

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
  (e: "edit-entry", entryId: number): void;
  (e: "delete-entry", entryId: number): void;
}>();
</script>
