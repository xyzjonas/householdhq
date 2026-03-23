<template>
  <section>
    <transaction-monthly-listing
      v-if="vehicle.transactions?.length"
      :transactions="vehicle.transactions as any"
    />

    <ui-empty
      v-else
      icon="i-ic-baseline-receipt-long"
      :title="$t('vehicle_tab_transactions')"
      :subtitle="$t('vehicle_transactions_empty')"
    />
  </section>
</template>

<script setup lang="ts">
import type { VehicleDetail } from "~/types";

defineProps<{
  vehicle: VehicleDetail;
}>();
</script>
