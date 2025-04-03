<template>
  <div v-for="(trans, key) in transactionsByMonth">
    <div class="border-b-solid border-1 border-b-[#777]">
      {{ formatDateKey(key as string) }}
    </div>
    <TransactionRow
      v-for="transaction in trans"
      :key="transaction.id"
      :transaction="transaction"
      class="upcomming"
    />
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

function getDate(key: string) {
  const [year, month] = (key as string).split("-");
  return new Date(parseInt(year), parseInt(month));
}

const i18n = useI18n();
function formatDateKey(key: string) {
  const [year, month] = key.split("-");
  const date = new Date(parseInt(year), parseInt(month));
  return formatMMYYYY(date, i18n.locale.value);
}
</script>
<style lang="css" scoped></style>
