<template>
  <div
    class="row item-row flex items-center justify-between gap-4 flex-wrap entry"
  >
    <div class="flex flex-col min-w-0 items-start">
      <span class="flex gap-3">
        <strong class="uppercase text-xl"> {{ entry.odometer }} km </strong>
      </span>
      <span class="flex gap-2 items-center">
        <span>{{ entry.fuelAmount }} L </span>
        <span class="text-gray-5 font-100">|</span>
        <span>{{ entry.unitPrice }} {{ entry.transaction.currency }} / L</span>
      </span>
      <span
        v-if="entry.isFullTank"
        class="flex border-solid border-1 rounded-full px-2 text-xs items-center gap-1 border-positive text-positive font-bold"
      >
        <i class="i-ic-baseline-local-gas-station text-md"></i>
        {{ $t("vehicle_fuel_full_tank") }}
      </span>
      <span class="text-xs text-[var(--text-200)] text-gray-5 mt-2">
        {{ formatDateTime(entry.fueledAt) }}
      </span>
    </div>

    <div class="text-right ml-auto">
      <ui-price
        :size="'1.25rem'"
        :amount="entry.transaction.amount"
        :currency="entry.transaction.currency"
      />
      <nuxt-link
        :to="`/transactions/${entry.transactionId}`"
        class="text-xs text-[var(--text-200)] truncate max-w-48"
      >
        {{ entry.transaction.description }}
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VehicleDetail } from "~/types";

const props = defineProps<{
  entry: VehicleDetail["fuelEntries"][number];
}>();

const { locale } = useI18n();

const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};
</script>

<style lang="scss" scoped>
.entry {
  border: 1px solid var(--border-100);
  border-radius: var(--border-radius);
  padding: 1rem;
}
</style>
