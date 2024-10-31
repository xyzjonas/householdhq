<template>
  <h1 class="title container mb-5">{{ transactions.length }} Transactions</h1>
  <div class="flex flex-col gap-10">
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
  </div>
</template>
<script setup lang="ts">
import type { Transaction } from "~/types";

type Response = {
  data: Transaction[];
  count: number;
};

const { data } = await useFetch<Response>("/api/transactions/all");

const transactions = computed(() => {
  if (!data.value) {
    return [];
  }

  const now = new Date();
  const result = data.value.data
    .filter((t) => new Date(t.transactedAt) > now)
    .filter((t) => t.isImportant);

  return result.sort(
    (a, b) =>
      new Date(a.transactedAt).getTime() - new Date(b.transactedAt).getTime()
  );
});

const transactionsByMonth = computed(() => {
  const months: { [key: string]: Transaction[] } = {};
  for (const trans of transactions.value) {
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
