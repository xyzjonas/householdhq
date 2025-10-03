<template>
  <div
    v-for="(trans, key) in transactionsByMonth"
    class="flex-col month-section mt-5 first:mt-0"
  >
    <div class="border-b-solid border-1 border-b-gray-5">
      {{ formatDateKey(key as string) }}
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
