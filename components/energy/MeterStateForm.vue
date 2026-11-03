<template>
  <form class="card w-sm flex flex-col gap-5">
    <div class="mb-3">
      <h2 class="uppercase mb-3">{{ $t("meter_state_create") }}</h2>
      <ui-pin :text="meterName" />
    </div>
    <ui-input v-model="date" type="date" :label="$t('meter_state_form_date')" />
    <ui-input v-model="time" type="time" :label="$t('meter_state_form_time')" />
    <ui-input
      v-model="meterState.value"
      :label="$t('meter_state_form_value')"
    />
    <ui-button
      :loading="loading"
      width="100%"
      height="3rem"
      type="submit"
      color="primary"
      @click="$emit('submit')"
      >{{ $t("t_send") }}</ui-button
    >
  </form>
</template>

<script setup lang="ts">
import type { MeterStateCreate } from "~/types";

defineProps<{
  loading?: boolean;
  meterName: string;
}>();

const meterState = defineModel<MeterStateCreate>({
  default: {
    meteredAt: new Date(),
    value: 0,
  },
});

const meteredAt = ref(meterState.value.meteredAt);
const { date, time } = useTimeAndDate(meteredAt);

watch(meteredAt, () => (meterState.value.meteredAt = meteredAt.value));

defineEmits(["submit"]);
</script>

<style lang="scss" scoped></style>
