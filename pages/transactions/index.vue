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
      <h1 v-if="notSearchedYet" class="text-center uppercase text-xl">
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

const notSearchedYet = ref(true);

const fetch = async () => {
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
