<template>
  <div class="flex my-3 justify-between items-center">
    <h1 class="text-xl">
      {{ $t("t_up_to") }}
      <span class="font-bold">{{ dateFormatted }}</span>
    </h1>
    <Transition name="page">
      <Spinner v-if="loading" />
    </Transition>
  </div>
  <!-- <div>{{ data }}</div> -->
  <div class="flex flex-col gap-2">
    <transaction-row
      :transaction="trans"
      v-for="trans in transactions"
      :key="trans.id"
      @delete="deleteTransaction"
      @patched="updateTransaction"
    ></transaction-row>
  </div>
  <ui-button icon="i-ic-arrow-downward" class="mt-5" @click="getNextBatch">{{
    $t("show_more")
  }}</ui-button>
</template>
<script setup lang="ts">
import type { Spinner } from "#components";
import type { Transaction } from "~/types";

const loading = ref(false);
const transactions = ref<Transaction[]>([]);

const { month, year, dateFormatted, goPrevious } = useMonth();

const fetch = async (query?: { year: number; month: number }) => {
  loading.value = true;
  const { data, status } = await useFetch<{ data: Transaction[] }>(
    `/api/transactions?year=${year.value}&month=${month.value}`
  );

  setTimeout(() => (loading.value = false), 200);
  if (status.value === "success") {
    transactions.value = [...transactions.value, ...(data.value?.data ?? [])];
  }
};

const getNextBatch = () => {
  goPrevious();
  fetch();
};

fetch();

const { token } = useTokenStore();

const deleteTransaction = (transactionData: Transaction) => {
  const url = "/api/transactions";
  loading.value = true;
  $fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: transactionData,
  })
    .then((res) => {
      transactions.value = transactions.value.filter(
        (t: Transaction) => t.id != transactionData.id
      );
    })
    .finally(() => (loading.value = false));
};

const transactionStore = useTransactionStore();
const updateTransaction = (transaction: Transaction) => {
  console.info("UPDATED");
  transactions.value = transactions.value.map((trans) => {
    if (trans.id === transaction.id) {
      return transaction;
    }
    return trans;
  });
};
</script>

<style lang="css" scoped>
.new-source {
  display: flex;
  gap: 0.3rem;
}

.input-box {
  flex: 3;
}

button {
  flex: 1;
}

h2 {
  font-weight: 400;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}
</style>
