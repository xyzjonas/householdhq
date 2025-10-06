<template>
  <div class="flex-col gap-2">
    <energy-meter-state-row
      v-for="state in meter.states ?? []"
      :state="state"
      :unit="meter.unit"
      @delete="() => $emit('delete', state.id)"
    ></energy-meter-state-row>
  </div>
</template>

<script setup lang="ts">
import type { Meter } from "~/types";

defineEmits(["delete"]);
const props = defineProps<{
  meter: Meter;
}>();

const states = computed(() => props.meter.states ?? []);
</script>

<style lang="scss" scoped></style>
