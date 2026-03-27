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

      <div class="grid grid-cols-2 gap-2 w-full sm:w-fit">
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

    <section
      class="mb-5 self-center w-full flex justify-center sm:justify-start"
    >
      <ui-toggle-bar v-model="activeTab" :options="tabOptions">
        <template #option="{ option }">
          <i :class="option" class="text-lg w-8" />
        </template>
      </ui-toggle-bar>
    </section>

    <vehicle-fuel-listing-tab
      v-if="activeTab === 0"
      :vehicle="vehicle"
      @edit-entry="openEditFuelEntryModal"
      @delete-entry="deleteFuelEntry"
    />

    <vehicle-maintenance-listing-tab
      v-else-if="activeTab === 1"
      :vehicle="vehicle"
      @edit-entry="openEditServiceEntryModal"
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

        <ui-modal v-model="editFuelEntryModal">
          <vehicle-fuel-entry-form
            v-model="editableFuelEntry"
            :loading="loading"
            :title="$t('edit')"
            :full-tank-entries="fullTankEntriesForEdit"
            :entry-id="editableFuelEntryId ?? undefined"
            @submit="editFuelEntry"
            @close="editFuelEntryModal = false"
            @delete="deleteFuelEntry(editableFuelEntryId!)"
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

        <ui-modal v-model="editServiceEntryModal">
          <vehicle-service-entry-form
            v-model="editableServiceEntry"
            :loading="loading"
            :title="$t('edit')"
            :entry-id="editableServiceEntryId ?? undefined"
            @submit="editServiceEntry"
            @close="editServiceEntryModal = false"
            @delete="deleteServiceEntry(editableServiceEntryId!)"
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
  VehicleFuelEntryUpdate,
  VehicleServiceEntryCreate,
  VehicleServiceEntryUpdate,
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
const editFuelEntryModal = ref(false);
const createServiceEntryModal = ref(false);
const editServiceEntryModal = ref(false);
const activeTab = ref(0);
const loading = ref(false);
const tokenStore = useTokenStore();
const editableFuelEntryId = ref<number | null>(null);
const editableServiceEntryId = ref<number | null>(null);

const editableVehicle = ref<VehicleUpdate>({});
const newFuelEntry = ref<VehicleFuelEntryCreate>({
  fueledAt: new Date(),
  odometer: 0,
  fuelAmount: 0,
  unitPrice: 0,
  isFullTank: true,
  previousFullTankFuelEntryId: undefined,
});

const editableFuelEntry = ref<VehicleFuelEntryCreate>({
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
  componentIds: [],
});

const editableServiceEntry = ref<VehicleServiceEntryCreate>({
  type: "REGULAR_MAINTENANCE",
  odometer: null,
  title: "",
  servicedAt: new Date(),
  description: "",
  componentIds: [],
});

const fullTankEntries = computed(() => {
  return (vehicle.value?.fuelEntries ?? []).filter((entry) => entry.isFullTank);
});

const fullTankEntriesForEdit = computed(() => {
  return fullTankEntries.value.filter(
    (entry) => entry.id !== editableFuelEntryId.value,
  );
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
    componentIds: [],
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
      mass: vehicle.value.mass,
      engineSize: vehicle.value.engineSize,
      fuelType: vehicle.value.fuelType,
      defaultFuelTransactionTitle:
        vehicle.value.defaultFuelTransactionTitle || "Fuel",
      maxPower: vehicle.value.maxPower,
      dateOfFabrication: vehicle.value.dateOfFabrication,
      dateFirstRegistered: vehicle.value.dateFirstRegistered,
      categoryId: vehicle.value.categoryId ?? undefined,
      fuelCategoryId: vehicle.value.fuelCategoryId ?? undefined,
    };
  }
  editVehicleModal.value = true;
};

const openEditFuelEntryModal = (entryId: number) => {
  const entry = vehicle.value?.fuelEntries.find((fuelEntry) => {
    return fuelEntry.id === entryId;
  });

  if (!entry) {
    return;
  }

  editableFuelEntryId.value = entry.id;
  editableFuelEntry.value = {
    fueledAt: new Date(entry.fueledAt),
    odometer: entry.odometer,
    fuelAmount: entry.fuelAmount,
    unitPrice: entry.unitPrice,
    isFullTank: entry.isFullTank,
    previousFullTankFuelEntryId: entry.previousFullTankFuelEntryId,
  };
  editFuelEntryModal.value = true;
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

const editFuelEntry = async () => {
  if (!editableFuelEntryId.value) {
    return;
  }

  loading.value = true;
  try {
    await tokenStore.patch(
      `/api/vehicles/${id}/fuel-entries/${editableFuelEntryId.value}`,
      editableFuelEntry.value as VehicleFuelEntryUpdate,
    );
    editFuelEntryModal.value = false;
    editableFuelEntryId.value = null;
    await refresh();
    useNotifications().addNotification({
      level: "success",
      text: $t("vehicle_fuel_entry_updated"),
    });
  } catch {
    useNotifications().addNotification({
      level: "error",
      text: $t("vehicle_fuel_entry_update_error"),
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

const openEditServiceEntryModal = (entryId: number) => {
  const entry = vehicle.value?.serviceEntries.find((serviceEntry) => {
    return serviceEntry.id === entryId;
  });

  if (!entry) {
    return;
  }

  editableServiceEntryId.value = entry.id;
  editableServiceEntry.value = {
    type: entry.type,
    odometer: entry.odometer,
    title: entry.title,
    servicedAt: new Date(entry.servicedAt),
    description: entry.description,
    componentIds: entry.components.map((c) => c.id),
  };
  editServiceEntryModal.value = true;
};

const editServiceEntry = async () => {
  if (!editableServiceEntryId.value) {
    return;
  }

  loading.value = true;
  try {
    await tokenStore.patch(
      `/api/vehicles/${id}/service-entries/${editableServiceEntryId.value}`,
      editableServiceEntry.value as VehicleServiceEntryUpdate,
    );
    editServiceEntryModal.value = false;
    editableServiceEntryId.value = null;
    await refresh();
    useNotifications().addNotification({
      level: "success",
      text: $t("vehicle_service_entry_updated"),
    });
  } catch {
    useNotifications().addNotification({
      level: "error",
      text: $t("vehicle_service_entry_update_error"),
    });
  } finally {
    loading.value = false;
  }
};

const deleteFuelEntry = async (entryId: number) => {
  loading.value = true;
  try {
    await tokenStore.del(`/api/vehicles/${id}/fuel-entries/${entryId}`);
    if (editableFuelEntryId.value === entryId) {
      editFuelEntryModal.value = false;
      editableFuelEntryId.value = null;
    }
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
    "i-ic-baseline-local-gas-station",
    "i-ic-baseline-build",
    "i-ic-baseline-receipt",
    "i-ic-baseline-settings",
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
