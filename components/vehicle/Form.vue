<template>
  <form
    class="card min-w-xs flex flex-col gap-5"
    @submit.prevent="$emit('submit')"
  >
    <h2 class="uppercase mb-3">{{ title }}</h2>

    <ui-input :label="$t('vehicle_name')" v-model="vehicle.name" />

    <div class="grid grid-cols-2 gap-4">
      <ui-input :label="$t('vehicle_brand')" v-model="vehicle.brand" />
      <ui-input :label="$t('vehicle_model')" v-model="vehicle.model" />
    </div>

    <ui-input :label="$t('vehicle_vin')" v-model="vehicle.vin" />
    <ui-input
      :label="$t('vehicle_registration')"
      v-model="vehicle.registration"
    />

    <div class="grid grid-cols-2 gap-4">
      <ui-color-input :label="$t('vehicle_color')" v-model="vehicle.color" />
      <ui-input
        :label="$t('vehicle_purchase_price')"
        type="number"
        v-model="vehicle.purchasePrice"
      />
    </div>

    <ui-input
      :label="$t('vehicle_purchased_at')"
      type="date"
      v-model="purchasedAtString"
    />

    <div class="icon-picker-wrap">
      <div class="icon-picker-label">{{ $t("vehicle_icon") }}</div>
      <div class="icon-picker">
        <button
          v-for="icon in iconOptions"
          :key="icon"
          type="button"
          class="icon-option"
          :class="{ selected: vehicle.icon === icon }"
          :title="icon"
          @click="toggleIcon(icon)"
        >
          <i :class="icon"></i>
        </button>
      </div>
    </div>

    <ui-button
      :loading="loading"
      :disabled="!canSubmit"
      width="100%"
      height="3rem"
      class="mt-3"
      type="submit"
      color="primary"
      >{{ $t("t_send") }}</ui-button
    >
  </form>
</template>

<script setup lang="ts">
import type { VehicleCreate, VehicleUpdate } from "~/types";

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    title: string;
  }>(),
  {
    loading: false,
  },
);

const vehicle = defineModel<VehicleCreate | VehicleUpdate>({
  default: {
    name: "",
    brand: "",
    model: "",
    vin: "",
    registration: "",
    icon: "",
    color: "#4f46e5",
    purchasePrice: undefined,
    purchasedAt: undefined,
  },
});

const iconOptions = [
  "i-simple-icons-tesla",
  "i-simple-icons-ford",
  "i-simple-icons-chevrolet",
  "i-simple-icons-bmw",
  "i-simple-icons-audi",
  "i-simple-icons-volkswagen",
  "i-simple-icons-mercedes",
  "i-simple-icons-porsche",
  "i-simple-icons-lamborghini",
  "i-simple-icons-ferrari",
  "i-simple-icons-toyota",
  "i-simple-icons-honda",
  "i-simple-icons-nissan",
  "i-simple-icons-mazda",
  "i-simple-icons-subaru",
  "i-simple-icons-hyundai",
  "i-simple-icons-skoda",
  "i-simple-icons-volvo",
  "i-simple-icons-renault",
  "i-simple-icons-peugeot",
  "i-simple-icons-citroen",
  "i-simple-icons-fiat",
  "i-simple-icons-alfaromeo",
  "i-simple-icons-jaguar",
  "i-simple-icons-rollsroyce",
  "i-simple-icons-bentley",
  "i-simple-icons-mini",
  "i-simple-icons-landrover",
  "i-simple-icons-maserati",
  "i-simple-icons-seat",
  "i-simple-icons-dacia",
  "i-simple-icons-bugatti",
  "i-simple-icons-opel",
  "i-simple-icons-yamahamotorcorporation",
  "i-simple-icons-ktm",
  "i-ic-baseline-two-wheeler",
  "i-ic-baseline-electric-car",
  "i-ic-baseline-directions-bike",
  "i-ic-baseline-airport-shuttle",
  "i-ic-baseline-local-taxi",
  "i-ic-baseline-local-shipping",
  "i-ic-baseline-construction",
  "i-ic-baseline-agriculture",
  "i-ic-baseline-delivery-dining",
  "i-ic-baseline-skateboarding",
  "i-ic-baseline-snowmobile",
  "i-ic-baseline-sports-motorsports",
  "i-ic-baseline-commute",
] as const;

const toggleIcon = (iconName: string) => {
  vehicle.value.icon = vehicle.value.icon === iconName ? "" : iconName;
};

const pickerColor = computed(() => vehicle.value.color || "#4f46e5");

const isDateString = (value: unknown): value is string => {
  return typeof value === "string";
};

const purchasedAtString = computed({
  get() {
    if (!vehicle.value.purchasedAt) return "";
    if (isDateString(vehicle.value.purchasedAt)) {
      return vehicle.value.purchasedAt.split("T")[0];
    }
    return vehicle.value.purchasedAt.toISOString().split("T")[0];
  },
  set(value: string) {
    vehicle.value.purchasedAt = value ? new Date(value) : undefined;
  },
});

const canSubmit = computed(
  () =>
    !!vehicle.value?.name?.trim() &&
    !!vehicle.value?.vin?.trim() &&
    !!vehicle.value?.registration?.trim() &&
    !!vehicle.value?.brand?.trim() &&
    !!vehicle.value?.model?.trim(),
);

defineEmits(["submit"]);
</script>

<style lang="scss" scoped>
.icon-picker-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.icon-picker-label {
  font-size: 0.9rem;
  color: var(--text-200);
}

.icon-picker {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 8px;
}

.icon-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid var(--bg-400);
  border-radius: 0.5rem;
  background: var(--bg-200);
  cursor: pointer;
  transition: all 0.2s ease;

  i {
    font-size: 1.8rem;
    color: var(--text-100);
  }

  &:hover {
    border-color: v-bind("pickerColor");
  }

  &.selected {
    border-color: v-bind("pickerColor");
    background: color-mix(in srgb, v-bind("pickerColor") 12%, var(--bg-200));

    i {
      color: v-bind("pickerColor");
    }
  }
}
</style>
