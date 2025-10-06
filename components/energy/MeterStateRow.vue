<template>
  <div
    class="border-b-solid border-1 border-gray-5 flex justify-between items-center p-1"
  >
    <span class="lowercase">{{
      formatddMMYYYY(new Date(state.meteredAt), locale)
    }}</span>
    <div class="flex items-center gap-3">
      <ui-price :amount="state.value" :currency-in="unit ?? '-'" />
      <ui-button
        outlined
        squared
        icon="i-ic-baseline-delete"
        @click="$emit('delete')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MeterState } from "~/types";

defineProps<{ state: MeterState; unit?: string }>();
defineEmits(["delete"]);

const i18n = useI18n();
const locale = computed(() => i18n.locale.value);
</script>

<style lang="scss" scoped></style>
