<template>
  <div class="flex my-3 justify-between items-center">
    <h1 class="text-xl flex">
      <span class="min-w-6 text-center">{{
        displayedTransactions.length
      }}</span>
      <span class="w-[1px] bg-gray-5 mr-2 ml-3"></span>
      <span class="mr-2">{{ $t("t_up_to") }}</span>
      <span class="font-bold">{{ dateFormatted }}</span>
    </h1>
    <Transition name="page">
      <Spinner v-if="loading" />
    </Transition>
  </div>

  <div class="flex my-3 gap-2">
    <ui-input v-model="search" label="Search for transactions"></ui-input>
    <ui-button icon="i-ic-arrow-downward" outlined flat @click="getNextBatch">{{
      $t("show_more")
    }}</ui-button>
  </div>

  <div class="flex flex-col gap-2">
    <transaction-row
      :transaction="trans"
      v-for="trans in displayedTransactions"
      :key="trans.id"
      @delete="deleteTransaction"
      @patched="updateTransaction"
    ></transaction-row>
  </div>
</template>
<script setup lang="ts">
import type { Spinner } from "#components";
import type { Transaction } from "~/types";

const search = ref("");
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

const { doesTransactionMatch } = useSearch();
const displayedTransactions = computed(() =>
  transactions.value.filter((trans) => {
    if (search.value) {
      return doesTransactionMatch(search.value, trans);
    } else {
      return true;
    }
  })
);

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
