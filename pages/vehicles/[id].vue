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

      <div class="flex items-center gap-2 self-center">
        <Transition name="page" mode="out-in">
          <spinner v-if="loading" class="item" />
          <div v-else class="flex items-center gap-2 ml-auto">
            <ui-button
              outlined
              icon="i-ic-baseline-edit"
              @click="openEditVehicleModal"
              >{{ $t("edit") }}</ui-button
            >
            <ui-button
              outlined
              icon="i-ic-baseline-delete"
              @click="deleteVehicle"
              >{{ $t("delete") }}</ui-button
            >
          </div>
        </Transition>
      </div>
    </section>

    <section class="vehicle-info-grid">
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
          <div class="w-6 h-6 rounded border vehicle-color"></div>
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

    <section v-if="vehicle.transactions?.length" class="mt-6">
      <transaction-monthly-listing
        :transactions="vehicle.transactions as any"
      />
    </section>

    <client-only>
      <teleport to="body">
        <ui-modal v-model="editVehicleModal">
          <vehicle-form
            v-model="editableVehicle"
            :loading="loading"
            :title="$t('edit')"
            @submit="editVehicle"
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
import type { VehicleDetail, VehicleUpdate } from "~/types";
import { useRoute, navigateTo } from "#app";

const route = useRoute();
const id = parseInt(route.params.id as string);

const { data: vehicleData, refresh } = await useFetch<{ data: VehicleDetail }>(
  `/api/vehicles/${id}`,
);

const vehicle = computed(() => vehicleData.value?.data);

const editVehicleModal = ref(false);
const loading = ref(false);

const editableVehicle = ref<VehicleUpdate>({});

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

const { locale } = useI18n();

const purchasedAtLabel = computed(() => {
  if (!vehicle.value?.purchasedAt) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
  }).format(new Date(vehicle.value.purchasedAt));
});

const createdAtLabel = computed(() => {
  if (!vehicle.value?.createdAt) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
  }).format(new Date(vehicle.value.createdAt));
});

const updatedAtLabel = computed(() => {
  if (!vehicle.value?.updatedAt) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
  }).format(new Date(vehicle.value.updatedAt));
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

.vehicle-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
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
