<template>
  <main
    :class="[
      'flex',
      'flex-col',
      'gap-5',
      'flex-1',
      notSearchedYet ? 'mt-30' : '',
    ]"
  >
    <div class="">
      <h1 class="text-center uppercase text-xl" v-if="notSearchedYet">
        search for transactions
      </h1>
      <ui-input
        v-model="search"
        label="search..."
        size="lg"
        class="my-5"
      ></ui-input>

      <TransactionMonthlyListing :transactions="displayedTransactions" />
      <ui-empty
        v-if="displayedTransactions.length <= 0 && !notSearchedYet"
        title="No results"
        subtitle="No transactions found matching your search criteria."
        icon="i-ic-baseline-search"
        :loading="loading"
      ></ui-empty>
    </div>
  </main>
</template>
<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import type { Transaction } from "~/types";

const search = ref("");
const loading = ref(false);
const transactions = ref<Transaction[]>([]);

const { month, year } = useMonth();

const notSearchedYet = ref(true);

const fetch = async (query?: { year: number; month: number }) => {
  const searchValue = search.value.trim();
  if (!searchValue) {
    return;
  }
  notSearchedYet.value = false;
  loading.value = true;
  const params = new URLSearchParams();

  params.set("search", searchValue);

  const response = await $fetch<{ data: Transaction[] }>(
    `/api/transactions?${params.toString()}`,
  ).catch(() => ({ data: [] }));

  setTimeout(() => (loading.value = false), 200);
  if (searchValue) {
    transactions.value = response.data ?? [];
  } else {
    transactions.value = [...transactions.value, ...(response.data ?? [])];
  }
};

const debouncedFetch = useDebounceFn(() => {
  transactions.value = [];
  fetch();
}, 500);

watch(search, () => {
  debouncedFetch();
});

const displayedTransactions = computed(() => transactions.value);

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
        (t: Transaction) => t.id != transactionData.id,
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
