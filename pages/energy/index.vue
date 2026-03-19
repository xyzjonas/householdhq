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
          <form
            class="card w-sm flex flex-col gap-5"
            @submit.prevent="createMeter"
          >
            <h2 class="uppercase mb-3">{{ $t("meter_create") }}</h2>
            <ui-input :label="$t('meter_name')" v-model="newMeter.name" />
            <ui-input :label="$t('meter_unit')" v-model="newMeter.unit" />
            <ui-input :label="$t('meter_icon')" v-model="newMeter.icon" />
            <ui-button
              :loading="loading"
              :disabled="!canCreateMeter"
              width="100%"
              height="3rem"
              class="mt-3"
              type="submit"
              color="primary"
              >{{ $t("t_send") }}</ui-button
            >
          </form>
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
});

const newMeter = ref<MeterCreate>(createDefaultMeter());
const canCreateMeter = computed(
  () => !!newMeter.value.name.trim() && !!newMeter.value.unit.trim(),
);

const tokenStore = useTokenStore();

const createMeter = async () => {
  if (!canCreateMeter.value) {
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
