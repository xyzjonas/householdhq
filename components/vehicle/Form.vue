<template>
  <form
    class="card min-w-xs flex flex-col gap-5 vehicle-form modal-window"
    @submit.prevent="$emit('submit')"
  >
    <div class="flex justify-between items-center">
      <h2 class="uppercase mb-0">{{ title }}</h2>
      <ui-close-button @click="$emit('close')" />
    </div>

    <ui-input v-model="vehicle.name" :label="$t('vehicle_name')" />

    <div class="grid grid-cols-2 gap-4 vehicle-form__grid">
      <ui-input v-model="vehicle.brand" :label="$t('vehicle_brand')" />
      <ui-input v-model="vehicle.model" :label="$t('vehicle_model')" />
    </div>

    <ui-input v-model="vehicle.vin" :label="$t('vehicle_vin')" />
    <ui-input
      v-model="vehicle.registration"
      :label="$t('vehicle_registration')"
    />

    <div class="grid grid-cols-2 gap-4 vehicle-form__grid">
      <ui-color-input v-model="vehicle.color" :label="$t('vehicle_color')" />
      <ui-input
        v-model="vehicle.purchasePrice"
        :label="$t('vehicle_purchase_price')"
        type="number"
      />
    </div>

    <ui-input
      v-model="purchasedAtString"
      :label="$t('vehicle_purchased_at')"
      type="date"
    />

    <div class="grid grid-cols-2 gap-4 vehicle-form__grid">
      <ui-input
        v-model="vehicle.mass"
        :label="$t('vehicle_mass')"
        type="number"
      />
      <ui-input
        v-model="vehicle.engineSize"
        :label="$t('vehicle_engine_size')"
        type="number"
      />
    </div>

    <div class="grid grid-cols-2 gap-4 vehicle-form__grid">
      <ui-input v-model="vehicle.fuelType" :label="$t('vehicle_fuel_type')" />
      <ui-input
        v-model="vehicle.maxPower"
        :label="$t('vehicle_max_power')"
        type="number"
      />
    </div>

    <ui-input
      v-model="vehicle.defaultFuelTransactionTitle"
      :label="$t('vehicle_default_fuel_transaction_title')"
    />

    <div class="grid grid-cols-2 gap-4 vehicle-form__grid">
      <ui-input
        v-model="dateOfFabricationString"
        :label="$t('vehicle_date_of_fabrication')"
        type="date"
      />
      <ui-input
        v-model="dateFirstRegisteredString"
        :label="$t('vehicle_date_first_registered')"
        type="date"
      />
    </div>

    <ui-select
      v-model.number="vehicle.categoryId"
      :label="$t('vehicle_maintenance_category')"
    >
      <option :value="null">—</option>
      <option
        v-for="category in categories"
        :key="category.id"
        :value="category.id"
      >
        {{ category.name }}
      </option>
    </ui-select>

    <ui-select
      v-model.number="vehicle.fuelCategoryId"
      :label="$t('vehicle_fuel_category')"
    >
      <option :value="null">—</option>
      <option
        v-for="category in categories"
        :key="`fuel-${category.id}`"
        :value="category.id"
      >
        {{ category.name }}
      </option>
    </ui-select>

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
import { useCategoriesStore } from "@/stores/categories";
import { storeToRefs } from "pinia";

const categoriesStore = useCategoriesStore();
const { categories } = storeToRefs(categoriesStore);
onMounted(() => categoriesStore.fetchCategories());

withDefaults(
  defineProps<{
    loading?: boolean;
    title: string;
  }>(),
  {
    loading: false,
  },
);

const vehicle = defineModel<VehicleCreate | VehicleUpdate>({
  default: () => ({
    name: "",
    brand: "",
    model: "",
    vin: "",
    registration: "",
    icon: "",
    color: "#4f46e5",
    purchasePrice: undefined,
    purchasedAt: undefined,
    mass: undefined,
    engineSize: undefined,
    fuelType: undefined,
    defaultFuelTransactionTitle: "Fuel",
    maxPower: undefined,
    dateOfFabrication: undefined,
    dateFirstRegistered: undefined,
    categoryId: undefined,
    fuelCategoryId: undefined,
  }),
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

const dateOfFabricationString = computed({
  get() {
    if (!vehicle.value.dateOfFabrication) return "";
    if (isDateString(vehicle.value.dateOfFabrication)) {
      return vehicle.value.dateOfFabrication.split("T")[0];
    }
    return vehicle.value.dateOfFabrication.toISOString().split("T")[0];
  },
  set(value: string) {
    vehicle.value.dateOfFabrication = value ? new Date(value) : undefined;
  },
});

const dateFirstRegisteredString = computed({
  get() {
    if (!vehicle.value.dateFirstRegistered) return "";
    if (isDateString(vehicle.value.dateFirstRegistered)) {
      return vehicle.value.dateFirstRegistered.split("T")[0];
    }
    return vehicle.value.dateFirstRegistered.toISOString().split("T")[0];
  },
  set(value: string) {
    vehicle.value.dateFirstRegistered = value ? new Date(value) : undefined;
  },
});

const canSubmit = computed(
  () =>
    !!vehicle.value?.name?.trim() &&
    !!vehicle.value?.vin?.trim() &&
    !!vehicle.value?.registration?.trim() &&
    !!vehicle.value?.brand?.trim() &&
    !!vehicle.value?.model?.trim() &&
    !!vehicle.value?.defaultFuelTransactionTitle?.trim(),
);

defineEmits(["submit", "close"]);
</script>

<style lang="scss" scoped>
.vehicle-form {
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

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

@media (max-width: 640px) {
  .vehicle-form {
    width: calc(100vw - 1rem);
    padding: 1rem;
  }

  .vehicle-form__grid {
    grid-template-columns: 1fr;
  }

  .icon-picker {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
