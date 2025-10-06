<template>
  <div class="flex-col gap-2">
    <div class="flex items-center justify-end gap-2">
      <ui-button
        outlined
        icon="i-ic-baseline-edit-calendar"
        @click="newStateModal = !newStateModal"
        >{{ $t("meter_state_create") }}</ui-button
      >
      <ui-button
        outlined
        icon="i-ic-baseline-electric-meter"
        @click="newMeterModal = !newMeterModal"
        >{{ $t("meter_create") }}</ui-button
      >
    </div>
    <div class="flex justify-between items-center">
      <ui-toggle-bar
        v-if="allMeters.length > 0"
        v-model="panel"
        :options="allMeters.map((meter) => meter.name)"
        item-width="10rem"
      />
      <ui-toggle-bar v-else :options="['No Meters']" disabled />
    </div>
    <energy-meter-state-list
      v-if="activeMeter"
      :meter="activeMeter"
      class="mt-5"
      @delete="deleteMeterState"
    />
    <client-only>
      <teleport to="body">
        <ui-modal v-model="newMeterModal">
          <form class="card w-sm flex flex-col gap-5">
            <h2 class="uppercase mb-3">{{ $t("meter_create") }}</h2>
            <ui-input :label="$t('meter_name')" v-model="newMeter.name" />
            <ui-input :label="$t('meter_unit')" v-model="newMeter.unit" />
            <ui-input :label="$t('meter_icon')" v-model="newMeter.icon" />
            <ui-button
              @click="createMeter"
              :loading="loading"
              :disabled="Object.keys(newMeter).length === 0"
              width="100%"
              height="3rem"
              class="mt-3"
              type="submit"
              color="primary"
              >{{ $t("t_send") }}</ui-button
            >
          </form> </ui-modal
        >"
      </teleport>
    </client-only>
    <client-only>
      <teleport to="body">
        <ui-modal v-model="newStateModal">
          <energy-meter-state-form
            v-model="newState"
            :loading="loading"
            :meter-name="activeMeter?.name ?? 'No meter selected'"
            @submit="createMeterState"
          /> </ui-modal
        >"
      </teleport>
    </client-only>
  </div>
</template>
<script setup lang="ts">
import type { Meter, MeterCreate, MeterStateCreate } from "~/types";

const panel = ref(0);

const route = useRoute();
const id = parseInt(route.params.id as string);
const { data, error, refresh } = await useFetch<{ data: Meter[] }>(
  `/api/meters`
);

const allMeters = computed(() => data.value?.data ?? []);
const activeMeter = computed(() => allMeters.value[panel.value]);

const newMeterModal = ref(false);
const loading = ref(false);
const newMeter = ref<MeterCreate>({
  name: "",
  unit: "",
  icon: "",
});

const tokenStore = useTokenStore();
const createMeter = async () => {
  loading.value = true;
  const url = "/api/meters";
  try {
    await tokenStore.post(url, newMeter.value);
    await refresh();
  } finally {
    loading.value = false;
    newMeterModal.value = false;
  }
};

const newStateModal = ref(false);
const newState = ref<MeterStateCreate>({
  meteredAt: new Date(),
  meterId: activeMeter.value?.id ?? -1,
  value: 0,
});
const createMeterState = async () => {
  loading.value = true;
  const url = "/api/meter-states";
  newState.value.meterId = activeMeter.value?.id ?? -1;
  try {
    await tokenStore.post(url, newState.value);
    await refresh();
  } finally {
    loading.value = false;
    newStateModal.value = false;
  }
};

const deleteMeterState = async (stateId: number) => {
  loading.value = true;
  const url = `/api/meter-states/${stateId}`;
  try {
    await tokenStore.del(url);
    await refresh();
  } finally {
    loading.value = false;
  }
};
</script>
<style lang=""></style>
