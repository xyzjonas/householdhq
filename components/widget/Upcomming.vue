<template>
  <div
    class="flex items-center gap-2 card bg-transparent"
    @click.capture="showUpcomming = !showUpcomming"
  >
    <div
      v-if="upcomming.length > 0"
      class="flex items-center justify-between gap-2 bg-transparent w-full"
    >
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-5">
          {{ upcomming.length }}
          {{ mapTransactionDeclention(upcomming.length) }}
        </span>
        <ui-price :amount="totalExpenses(upcomming)" :currency="currency" />
      </div>
      <ui-chevron v-model="showUpcomming" readonly />
    </div>
    <div v-else class="flex w-full justify-between items-center text-gray-5">
      <span>{{ $t("t_upcomming_no_more") }}</span>
      <i class="text-3xl i-ic-baseline-price-check text-green"></i>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Transaction } from "~/types";

defineProps<{ upcomming: Transaction[]; currency?: string }>();

const showUpcomming = defineModel("show");

const { t } = useI18n();
const mapTransactionDeclention = (count: number) => {
  if (count === 1) {
    return t("t_upcomming_1");
  } else if (count > 1 && count < 5) {
    return t("t_upcomming_2");
  } else {
    return t("t_upcomming_5");
  }
};
</script>

<style></style>
