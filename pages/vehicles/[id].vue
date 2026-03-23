<template>
  <div v-if="vehicle" class="flex-col">
    <section
      class="row title vehicle-title-row gap-4 mb-5 flex-wrap justify-between"
    >
      <div class="flex items-center gap-5 min-w-0">
        <span class="vehicle-icon">
          <i :class="vehicleIcon"></i>
        </span>

        <div class="min-w-0 flex flex-col gap-1">
          <h1 class="uppercase text-3xl truncate">{{ vehicle.name }}</h1>
          <div
            class="flex items-center gap-2 flex-wrap text-sm text-[var(--text-200)]"
          >
            <ui-pin
              :text="`${vehicle.brand} ${vehicle.model}`"
              size="small"
              class="w-1 overflow-hidden"
            />
            <ui-pin :text="vehicle.registration" size="small" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <ui-button
          outlined
          icon="i-ic-baseline-local-gas-station"
          @click="createFuelEntryModal = true"
          width="100%"
          >{{ $t("vehicle_fuel_entry_create") }}</ui-button
        >
        <ui-button
          outlined
          icon="i-ic-baseline-build"
          @click="createServiceEntryModal = true"
          width="100%"
          >{{ $t("vehicle_service_entry_create") }}</ui-button
        >
        <ui-button
          outlined
          icon="i-ic-baseline-edit"
          @click="openEditVehicleModal"
          width="100%"
          >{{ $t("edit") }}</ui-button
        >
        <ui-button
          outlined
          icon="i-ic-baseline-delete"
          @click="deleteVehicle"
          width="100%"
          >{{ $t("delete") }}</ui-button
        >
      </div>
    </section>

    <section class="mb-5">
      <ui-toggle-bar v-model="activeTab" :options="tabOptions" />
    </section>

    <vehicle-fuel-listing-tab
      v-if="activeTab === 0"
      :vehicle="vehicle"
      @delete-entry="deleteFuelEntry"
    />

    <vehicle-maintenance-listing-tab
      v-else-if="activeTab === 1"
      :vehicle="vehicle"
      @delete-entry="deleteServiceEntry"
    />

    <vehicle-transactions-listing-tab
      v-else-if="activeTab === 2"
      :vehicle="vehicle"
    />

    <vehicle-details-tab v-else :vehicle="vehicle" />

    <client-only>
      <teleport to="body">
        <ui-modal v-model="createFuelEntryModal">
          <vehicle-fuel-entry-form
            v-model="newFuelEntry"
            :loading="loading"
            :title="$t('vehicle_fuel_entry_create')"
            :full-tank-entries="fullTankEntries"
            @submit="createFuelEntry"
            @close="createFuelEntryModal = false"
          />
        </ui-modal>

        <ui-modal v-model="createServiceEntryModal">
          <vehicle-service-entry-form
            v-model="newServiceEntry"
            :loading="loading"
            :title="$t('vehicle_service_entry_create')"
            @submit="createServiceEntry"
            @close="createServiceEntryModal = false"
          />
        </ui-modal>

        <ui-modal v-model="editVehicleModal">
          <vehicle-form
            v-model="editableVehicle"
            :loading="loading"
            :title="$t('edit')"
            @submit="editVehicle"
            @close="editVehicleModal = false"
          />
        </ui-modal>
      </teleport>
    </client-only>
  </div>

  <div v-else class="flex items-center justify-center min-h-screen">
    <spinner />
  </div>
</template>

<script setup lang="ts">
import type {
  VehicleDetail,
  VehicleFuelEntryCreate,
  VehicleServiceEntryCreate,
  VehicleUpdate,
} from "~/types";
import { useRoute, navigateTo } from "#app";

const route = useRoute();
const id = parseInt(route.params.id as string);

const { data: vehicleData, refresh } = await useFetch<{ data: VehicleDetail }>(
  `/api/vehicles/${id}`,
);

const vehicle = computed(() => vehicleData.value?.data);

const editVehicleModal = ref(false);
const createFuelEntryModal = ref(false);
const createServiceEntryModal = ref(false);
const activeTab = ref(0);
const loading = ref(false);
const tokenStore = useTokenStore();

const editableVehicle = ref<VehicleUpdate>({});
const newFuelEntry = ref<VehicleFuelEntryCreate>({
  fueledAt: new Date(),
  odometer: 0,
  fuelAmount: 0,
  unitPrice: 0,
  isFullTank: true,
  previousFullTankFuelEntryId: undefined,
});

const newServiceEntry = ref<VehicleServiceEntryCreate>({
  type: "REGULAR_MAINTENANCE",
  odometer: null,
  title: "",
  servicedAt: new Date(),
  description: "",
});

const fullTankEntries = computed(() => {
  return (vehicle.value?.fuelEntries ?? []).filter((entry) => entry.isFullTank);
});

const resetFuelEntryForm = () => {
  newFuelEntry.value = {
    fueledAt: new Date(),
    odometer: 0,
    fuelAmount: 0,
    unitPrice: 0,
    isFullTank: true,
    previousFullTankFuelEntryId: undefined,
  };
};

const resetServiceEntryForm = () => {
  newServiceEntry.value = {
    type: "REGULAR_MAINTENANCE",
    odometer: null,
    title: "",
    servicedAt: new Date(),
    description: "",
  };
};

const openEditVehicleModal = () => {
  if (vehicle.value) {
    editableVehicle.value = {
      name: vehicle.value.name,
      brand: vehicle.value.brand,
      model: vehicle.value.model,
      vin: vehicle.value.vin,
      registration: vehicle.value.registration,
      icon: vehicle.value.icon,
      color: vehicle.value.color,
      purchasePrice: vehicle.value.purchasePrice,
      purchasedAt: vehicle.value.purchasedAt,
      categoryId: vehicle.value.categoryId ?? undefined,
    };
  }
  editVehicleModal.value = true;
};

const editVehicle = async () => {
  loading.value = true;
  try {
    await $fetch(`/api/vehicles/${id}`, {
      method: "PATCH",
      body: editableVehicle.value,
    });

    editVehicleModal.value = false;
    await refresh();

    useNotifications().addNotification({
      level: "success",
      text: $t("vehicle_updated"),
    });
  } catch (error) {
    useNotifications().addNotification({
      level: "error",
      text: $t("vehicle_update_error"),
    });
  } finally {
    loading.value = false;
  }
};

const deleteVehicle = async () => {
  if (confirm($t("vehicle_delete_confirmation") || "Are you sure?")) {
    loading.value = true;
    try {
      await $fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
      });

      useNotifications().addNotification({
        level: "success",
        text: $t("vehicle_deleted"),
      });
      await navigateTo("/vehicles");
    } catch (error) {
      useNotifications().addNotification({
        level: "error",
        text: $t("vehicle_delete_error"),
      });
    } finally {
      loading.value = false;
    }
  }
};

const createFuelEntry = async () => {
  loading.value = true;
  try {
    await tokenStore.post(
      `/api/vehicles/${id}/fuel-entries`,
      newFuelEntry.value as any,
    );
    createFuelEntryModal.value = false;
    resetFuelEntryForm();
    await refresh();
    useNotifications().addNotification({
      level: "success",
      text: $t("vehicle_fuel_entry_created"),
    });
  } catch {
    useNotifications().addNotification({
      level: "error",
      text: $t("vehicle_fuel_entry_create_error"),
    });
  } finally {
    loading.value = false;
  }
};

const createServiceEntry = async () => {
  loading.value = true;
  try {
    await tokenStore.post(
      `/api/vehicles/${id}/service-entries`,
      newServiceEntry.value as any,
    );
    createServiceEntryModal.value = false;
    resetServiceEntryForm();
    await refresh();
    useNotifications().addNotification({
      level: "success",
      text: $t("vehicle_service_entry_created"),
    });
  } catch {
    useNotifications().addNotification({
      level: "error",
      text: $t("vehicle_service_entry_create_error"),
    });
  } finally {
    loading.value = false;
  }
};

const deleteFuelEntry = async (entryId: number) => {
  loading.value = true;
  try {
    await tokenStore.del(`/api/vehicles/${id}/fuel-entries/${entryId}`);
    await refresh();
  } finally {
    loading.value = false;
  }
};

const deleteServiceEntry = async (entryId: number) => {
  loading.value = true;
  try {
    await tokenStore.del(`/api/vehicles/${id}/service-entries/${entryId}`);
    await refresh();
  } finally {
    loading.value = false;
  }
};

const { t } = useI18n();

const tabOptions = computed(() => {
  return [
    t("vehicle_fuel_entries"),
    t("vehicle_service_entries"),
    t("vehicle_tab_transactions"),
    t("vehicle_tab_details"),
  ];
});

const vehicleIcon = computed(
  () => vehicle.value?.icon || "i-ic-baseline-directions-car",
);

const vehicleColor = computed(
  () => vehicle.value?.color || "var(--primary-100)",
);

definePageMeta({
  layout: "default",
});
</script>

<style lang="scss" scoped>
.vehicle-color {
  background-color: v-bind("vehicleColor");
}

.vehicle-title-row {
  border-radius: 0.75rem;
}

.vehicle-icon {
  display: inline-flex;
  align-items: center;
  justify-items: center;
  width: 5rem;
  height: 5rem;
  border-radius: 0.8rem;
  background: color-mix(in srgb, v-bind("vehicleColor") 12%, var(--bg-300));
  color: v-bind("vehicleColor");
  flex-shrink: 0;
  justify-content: center;

  i {
    font-size: 3rem;
  }
}
</style>
