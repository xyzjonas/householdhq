<template>
  <div class="flex-col gap-3">
    <div class="flex items-center justify-end gap-2">
      <ui-button
        outlined
        icon="i-ic-baseline-directions-car"
        @click="newVehicleModal = true"
        >{{ $t("vehicle_create") }}</ui-button
      >
    </div>

    <section class="card flex flex-col gap-4">
      <template v-if="sortedVehicles.length > 0">
        <vehicle-row
          v-for="vehicle in sortedVehicles"
          :key="vehicle.id"
          :vehicle="vehicle"
        />
      </template>

      <ui-empty
        v-else
        icon="i-ic-baseline-directions-car"
        :title="$t('vehicle_none_title')"
        :subtitle="$t('vehicle_none_subtitle')"
      />
    </section>

    <client-only>
      <teleport to="body">
        <ui-modal v-model="newVehicleModal">
          <vehicle-form
            v-model="newVehicle"
            :title="$t('vehicle_create')"
            :loading="loading"
            @submit="createVehicle"
          />
        </ui-modal>
      </teleport>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import type { Vehicle, VehicleCreate } from "~/types";

const { data, refresh } = await useFetch<{ data: Vehicle[] }>(`/api/vehicles`);

const sortedVehicles = computed(() =>
  [...(data.value?.data ?? [])].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  ),
);

const newVehicleModal = ref(false);
const loading = ref(false);

const createDefaultVehicle = (): VehicleCreate => ({
  vin: "",
  registration: "",
  name: "",
  brand: "",
  model: "",
  icon: "",
  color: "#4f46e5",
  purchasePrice: undefined,
  purchasedAt: undefined,
  mass: undefined,
  engineSize: undefined,
  fuelType: undefined,
  maxPower: undefined,
  dateOfFabrication: undefined,
  dateFirstRegistered: undefined,
  categoryId: undefined,
  fuelCategoryId: undefined,
});

const newVehicle = ref<VehicleCreate>(createDefaultVehicle());

const createVehicle = async () => {
  loading.value = true;
  try {
    await $fetch("/api/vehicles", {
      method: "POST",
      body: newVehicle.value,
    });

    newVehicleModal.value = false;
    newVehicle.value = createDefaultVehicle();
    await refresh();

    useNotifications().addNotification({
      level: "success",
      text: $t("vehicle_created"),
    });
  } catch (error) {
    useNotifications().addNotification({
      level: "error",
      text: $t("vehicle_create_error"),
    });
  } finally {
    loading.value = false;
  }
};

definePageMeta({
  layout: "default",
});
</script>

<style lang="scss" scoped></style>
