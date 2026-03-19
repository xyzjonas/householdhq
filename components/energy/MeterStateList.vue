<template>
  <ui-timeline :items="meter.states ?? []" item-key="id" color="#38c089">
    <template #item="{ item }">
      <energy-meter-state-row
        :state="item"
        :unit="meter.unit"
        @delete="() => emit('delete', item.id)"
      />
    </template>
  </ui-timeline>
</template>

<script setup lang="ts">
import type { Meter } from "~/types";

const emit = defineEmits<{
  delete: [stateId: number];
}>();

defineProps<{
  meter: Meter;
}>();
</script>

<style lang="scss" scoped></style>
