<template>
  <div>
    <div v-for="(trans, key) in transactionsByMonth" class="month-section">
      <div class="flex items-center mb-3 gap-3">
        <span class="circle-sm bg-blue"></span>
        <div class="text-xl font-bold light:text-dark-1 dark:text-gray-3">
          {{ formatDateKey(key as string) }}
        </div>
      </div>
      <div class="flex-col gap-2">
        <TransactionRow
          v-for="transaction in trans"
          :key="transaction.id"
          :transaction="transaction"
          class="upcomming"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from "~/types";

const props = defineProps<{
  transactions: Transaction[];
}>();

type Response = {
  data: Transaction[];
  count: number;
};

const transactionsByMonth = computed(() => {
  const months: { [key: string]: Transaction[] } = {};
  for (const trans of props.transactions) {
    const date = new Date(trans.transactedAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    if (!months[monthKey]) {
      months[monthKey] = [trans];
    } else {
      months[monthKey].push(trans);
    }
  }
  return months;
});

const i18n = useI18n();
function formatDateKey(key: string): string {
  const [year, month] = key.split("-");
  if (year && month) {
    const date = new Date(parseInt(year), parseInt(month));
    return formatMMYYYY(date, i18n.locale.value);
  }
  return key;
}
</script>

<style lang="css" scoped>
.month-section:not(:first-child) {
  margin-top: 2rem;
}
</style>
