<template>
  <ui-list-row
    class="vehicle-row flex items-center justify-between gap-4"
    @click="navigateTo(`/vehicles/${vehicle.id}`)"
  >
    <div class="flex items-center gap-8 min-w-0">
      <span class="vehicle-icon">
        <i :class="vehicleIcon"></i>
      </span>

      <div class="min-w-0 flex flex-col gap-1">
        <span class="vehicle-name truncate">{{ vehicle.name }}</span>
        <div class="flex flex-col flex-wrap text-sm text-[var(--text-200)]">
          <div class="flex gap-2">
            <ui-pin :text="`${vehicle.brand} ${vehicle.model}`" size="small" />
            <ui-pin :text="vehicle.registration" size="small" />
          </div>
          <span v-if="vehicle.purchasedAt" class="text-[11px]"
            >{{ $t("vehicle_purchased_at") }} {{ purchasedAtLabel }}</span
          >
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3 shrink-0">
      <div v-if="vehicle.purchasePrice" class="text-right">
        <div class="vehicle-label">{{ $t("vehicle_purchase_price") }}</div>
        <ui-price
          :amount="vehicle.purchasePrice"
          currency-in="EUR"
          size="1rem"
        />
      </div>
      <i class="i-ic-baseline-chevron-right text-xl opacity-50"></i>
    </div>
  </ui-list-row>
</template>

<script setup lang="ts">
import type { Vehicle } from "~/types";

const props = defineProps<{
  vehicle: Vehicle;
}>();

const { locale } = useI18n();

const vehicleIcon = computed(
  () => props.vehicle.icon || "i-ic-baseline-directions-car",
);

const vehicleColor = computed(
  () => props.vehicle.color || "var(--primary-100)",
);

const purchasedAtLabel = computed(() => {
  if (!props.vehicle.purchasedAt) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
  }).format(new Date(props.vehicle.purchasedAt));
});
</script>

<style lang="scss" scoped>
.vehicle-row {
  border-radius: 0.75rem;
}

.vehicle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  border-radius: 0.8rem;
  background: color-mix(in srgb, v-bind("vehicleColor") 12%, var(--bg-300));
  color: v-bind("vehicleColor");
  flex-shrink: 0;

  i {
    font-size: 2.4rem;
  }
}

.vehicle-name {
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.vehicle-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.65;
}
</style>
