<template>
  <section class="vehicle-info-grid gap-1">
    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_vin") }}</span>
      <span class="info-value">{{ vehicle.vin }}</span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_registration") }}</span>
      <span class="info-value">{{ vehicle.registration }}</span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_model") }}</span>
      <span class="info-value">{{ vehicle.brand }} {{ vehicle.model }}</span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_color") }}</span>
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded border" :style="colorStyle"></div>
        <span class="info-value">{{ vehicle.color || "—" }}</span>
      </div>
    </div>

    <div v-if="vehicle.purchasePrice" class="card info-card">
      <span class="info-label">{{ $t("vehicle_purchase_price") }}</span>
      <ui-price
        :amount="vehicle.purchasePrice"
        currency-in="EUR"
        size="1.1rem"
      />
    </div>

    <div v-if="vehicle.purchasedAt" class="card info-card">
      <span class="info-label">{{ $t("vehicle_purchased_at") }}</span>
      <span class="info-value">{{ purchasedAtLabel }}</span>
    </div>

    <div v-if="vehicle.linkedCategory" class="card info-card">
      <span class="info-label">{{ $t("vehicle_category") }}</span>
      <category-badge :category="vehicle.linkedCategory as any" />
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_created_at") }}</span>
      <span class="info-value">{{ createdAtLabel }}</span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_updated_at") }}</span>
      <span class="info-value">{{ updatedAtLabel }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { VehicleDetail } from "~/types";

const props = defineProps<{
  vehicle: VehicleDetail;
}>();

const { locale } = useI18n();

const purchasedAtLabel = computed(() => {
  if (!props.vehicle?.purchasedAt) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
  }).format(new Date(props.vehicle.purchasedAt));
});

const createdAtLabel = computed(() => {
  if (!props.vehicle?.createdAt) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
  }).format(new Date(props.vehicle.createdAt));
});

const updatedAtLabel = computed(() => {
  if (!props.vehicle?.updatedAt) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
  }).format(new Date(props.vehicle.updatedAt));
});

const colorStyle = computed(() => {
  return {
    backgroundColor: props.vehicle?.color || "var(--primary-100)",
  };
});
</script>

<style scoped lang="scss">
.vehicle-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  margin-bottom: 2rem;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
}

.info-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.65;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
}
</style>
