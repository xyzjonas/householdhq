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
        <span class="info-value" :class="{ muted: !vehicle.color }">
          {{ vehicle.color || emptyLabel }}
        </span>
      </div>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_purchase_price") }}</span>
      <ui-price
        v-if="vehicle.purchasePrice != null"
        :amount="vehicle.purchasePrice"
        currency-in="EUR"
        size="1.1rem"
      />
      <span v-else class="info-value muted">{{ emptyLabel }}</span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_mass") }}</span>
      <span class="info-value" :class="{ muted: vehicle.mass == null }">
        {{ formatNumber(vehicle.mass, "kg") }}
      </span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_engine_size") }}</span>
      <span class="info-value" :class="{ muted: vehicle.engineSize == null }">
        {{ formatNumber(vehicle.engineSize, "cc") }}
      </span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_fuel_type") }}</span>
      <span class="info-value" :class="{ muted: !vehicle.fuelType }">
        {{ vehicle.fuelType || emptyLabel }}
      </span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_default_fuel_transaction_title") }}</span>
      <span
        class="info-value"
        :class="{ muted: !vehicle.defaultFuelTransactionTitle }"
      >
        {{ vehicle.defaultFuelTransactionTitle || emptyLabel }}
      </span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_max_power") }}</span>
      <span class="info-value" :class="{ muted: vehicle.maxPower == null }">
        {{ formatNumber(vehicle.maxPower, "kW") }}
      </span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_maintenance_category") }}</span>
      <category-badge
        v-if="vehicle.linkedCategory"
        :category="vehicle.linkedCategory as any"
      />
      <span v-else class="info-value muted">{{ emptyLabel }}</span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_fuel_category") }}</span>
      <category-badge
        v-if="vehicle.linkedFuelCategory"
        :category="vehicle.linkedFuelCategory as any"
      />
      <span v-else class="info-value muted">{{ emptyLabel }}</span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_date_of_fabrication") }}</span>
      <span class="info-value" :class="{ muted: !vehicle.dateOfFabrication }">
        {{ formatDate(vehicle.dateOfFabrication) }}
      </span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_date_first_registered") }}</span>
      <span class="info-value" :class="{ muted: !vehicle.dateFirstRegistered }">
        {{ formatDate(vehicle.dateFirstRegistered) }}
      </span>
    </div>

    <div class="card info-card">
      <span class="info-label">{{ $t("vehicle_purchased_at") }}</span>
      <span class="info-value" :class="{ muted: !vehicle.purchasedAt }">{{
        purchasedAtLabel
      }}</span>
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
const emptyLabel = "Not filled in";

const formatDate = (value: string | Date | null | undefined) => {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
  }).format(new Date(value));
};

const formatNumber = (value: number | null | undefined, unit?: string) => {
  if (value == null) {
    return emptyLabel;
  }

  const formatted = new Intl.NumberFormat(locale.value, {
    maximumFractionDigits: 2,
  }).format(value);
  return unit ? `${formatted} ${unit}` : formatted;
};

const purchasedAtLabel = computed(() => {
  return formatDate(props.vehicle?.purchasedAt);
});

const createdAtLabel = computed(() => {
  return formatDate(props.vehicle?.createdAt);
});

const updatedAtLabel = computed(() => {
  return formatDate(props.vehicle?.updatedAt);
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

.muted {
  opacity: 0.6;
  font-weight: 400;
}
</style>
