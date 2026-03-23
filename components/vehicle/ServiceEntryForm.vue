<template>
  <form
    class="card min-w-xs flex flex-col gap-4"
    @submit.prevent="$emit('submit')"
  >
    <div class="flex justify-between items-center">
      <h2 class="uppercase mb-2">{{ title }}</h2>
      <ui-close-button @click="$emit('close')" />
    </div>

    <ui-select v-model="entry.type" :label="$t('vehicle_service_type')">
      <option value="REGULAR_MAINTENANCE">
        {{ $t("vehicle_service_type_regular") }}
      </option>
      <option value="DEFECT">{{ $t("vehicle_service_type_defect") }}</option>
    </ui-select>

    <ui-input :label="$t('vehicle_service_title')" v-model="entry.title" />

    <ui-input
      :label="$t('vehicle_service_datetime')"
      type="datetime-local"
      v-model="servicedAtInput"
    />

    <ui-input
      :label="$t('vehicle_service_odometer')"
      type="number"
      v-model="odometerValue"
    />

    <div class="service-description">
      <label>{{ $t("vehicle_service_description") }}</label>
      <textarea v-model="entry.description" rows="5" />
    </div>

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
import type { VehicleServiceEntryCreate } from "~/types";

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    title: string;
  }>(),
  {
    loading: false,
  },
);

const entry = defineModel<VehicleServiceEntryCreate>({
  default: {
    type: "REGULAR_MAINTENANCE",
    odometer: null,
    title: "",
    servicedAt: new Date(),
    description: "",
  },
});

const servicedAtInput = computed({
  get() {
    const date = entry.value.servicedAt
      ? new Date(entry.value.servicedAt)
      : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  },
  set(value: string) {
    entry.value.servicedAt = value ? new Date(value) : new Date();
  },
});

const odometerValue = computed({
  get() {
    return entry.value.odometer ?? undefined;
  },
  set(value: number | undefined) {
    entry.value.odometer = Number.isFinite(value) ? value : null;
  },
});

const canSubmit = computed(() => {
  return !!entry.value.title?.trim();
});

defineEmits(["submit", "close"]);
</script>

<style scoped>
.service-description {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

textarea {
  min-height: 6rem;
  border-radius: 0.5rem;
  border: 1px solid var(--bg-400);
  background: var(--bg-100);
  color: var(--text-100);
  padding: 0.75rem;
}
</style>
