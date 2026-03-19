<template>
  <div class="flex-col gap-3">
    <div class="flex items-center justify-end gap-2">
      <ui-button
        outlined
        icon="i-ic-baseline-electric-meter"
        @click="newMeterModal = true"
        >{{ $t("meter_create") }}</ui-button
      >
    </div>

    <section class="card flex flex-col gap-4">
      <template v-if="sortedMeters.length > 0">
        <energy-row
          v-for="meter in sortedMeters"
          :key="meter.id"
          :meter="meter"
        />
      </template>

      <ui-empty
        v-else
        icon="i-ic-baseline-electric-meter"
        :title="$t('meter_none_title')"
        :subtitle="$t('meter_none_subtitle')"
      />
    </section>

    <client-only>
      <teleport to="body">
        <ui-modal v-model="newMeterModal">
          <energy-meter-form
            v-model="newMeter"
            :title="$t('meter_create')"
            :loading="loading"
            @submit="createMeter"
          />
        </ui-modal>
      </teleport>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import type { Meter, MeterCreate } from "~/types";

const { data, refresh } = await useFetch<{ data: Meter[] }>(`/api/meters`);

const sortedMeters = computed(() =>
  [...(data.value?.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
);

const newMeterModal = ref(false);
const loading = ref(false);

const createDefaultMeter = (): MeterCreate => ({
  name: "",
  unit: "",
  icon: "",
  color: "#38c089",
});

const newMeter = ref<MeterCreate>(createDefaultMeter());

const tokenStore = useTokenStore();

const createMeter = async () => {
  if (!newMeter.value.name.trim() || !newMeter.value.unit.trim()) {
    return;
  }

  loading.value = true;

  try {
    const createdMeter = (await tokenStore.post(
      "/api/meters",
      newMeter.value,
    )) as Meter;

    newMeter.value = createDefaultMeter();
    newMeterModal.value = false;
    await refresh();

    if (createdMeter?.id) {
      await navigateTo(`/energy/${createdMeter.id}`);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style lang=""></style>
