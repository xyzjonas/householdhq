<template>
  <form
    class="card min-w-xs flex flex-col gap-4"
    @submit.prevent="$emit('submit')"
  >
    <div class="flex justify-between items-center">
      <h2 class="uppercase mb-2">{{ title }}</h2>
      <ui-close-button @click="$emit('close')" />
    </div>

    <ui-input
      :label="$t('vehicle_fuel_datetime')"
      type="datetime-local"
      v-model="fueledAtInput"
    />

    <div class="grid grid-cols-2 gap-4">
      <ui-input
        :label="$t('vehicle_fuel_odometer')"
        type="number"
        v-model="entry.odometer"
      />
      <ui-input
        :label="$t('vehicle_fuel_amount')"
        type="number"
        v-model="entry.fuelAmount"
      />
    </div>

    <ui-input
      :label="$t('vehicle_fuel_unit_price')"
      type="number"
      v-model="entry.unitPrice"
    />

    <ui-select
      :model-value="entry.previousFullTankFuelEntryId ?? -1"
      :label="$t('vehicle_previous_full_tank')"
      @update:model-value="onPreviousFullTankChange"
    >
      <option :value="-1">{{ $t("vehicle_previous_full_tank_auto") }}</option>
      <option :value="0">{{ $t("vehicle_previous_full_tank_none") }}</option>
      <option
        v-for="fuelEntry in fullTankEntries"
        :key="fuelEntry.id"
        :value="fuelEntry.id"
      >
        {{ previousEntryLabel(fuelEntry) }}
      </option>
    </ui-select>

    <label class="flex items-center gap-3">
      <ui-toggle v-model="entry.isFullTank" />
      <span>{{ $t("vehicle_fuel_full_tank") }}</span>
    </label>

    <ui-button
      :loading="loading"
      :disabled="!canSubmit"
      width="100%"
      height="3rem"
      type="submit"
      color="primary"
    >
      {{ $t("t_send") }}
    </ui-button>
  </form>
</template>

<script setup lang="ts">
import type { VehicleFuelEntryCreate } from "~/types";

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    title: string;
    fullTankEntries: Array<{
      id: number;
      fueledAt: Date | string;
      odometer: number;
    }>;
  }>(),
  {
    loading: false,
  },
);

const entry = defineModel<VehicleFuelEntryCreate>({
  default: {
    fueledAt: new Date(),
    odometer: 0,
    fuelAmount: 0,
    unitPrice: 0,
    isFullTank: true,
    previousFullTankFuelEntryId: undefined,
  },
});

const previousEntryLabel = (fuelEntry: {
  fueledAt: Date | string;
  odometer: number;
}) => {
  const date = new Date(fuelEntry.fueledAt);
  return `${date.toLocaleDateString()} · ${fuelEntry.odometer}`;
};

const fueledAtInput = computed({
  get() {
    const date = entry.value.fueledAt
      ? new Date(entry.value.fueledAt)
      : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  },
  set(value: string) {
    entry.value.fueledAt = value ? new Date(value) : new Date();
  },
});

const onPreviousFullTankChange = (value: string | number) => {
  const parsed = Number(value);
  if (parsed === -1) {
    entry.value.previousFullTankFuelEntryId = undefined;
    return;
  }

  if (parsed === 0) {
    entry.value.previousFullTankFuelEntryId = null;
    return;
  }

  entry.value.previousFullTankFuelEntryId = parsed;
};

const canSubmit = computed(() => {
  return (
    entry.value.fuelAmount > 0 &&
    entry.value.unitPrice >= 0 &&
    entry.value.odometer >= 0
  );
});

defineEmits(["submit", "close"]);
</script>
