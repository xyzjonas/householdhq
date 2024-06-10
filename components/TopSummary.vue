<template>
  <div class="card center">
    <section class="hdr" v-if="!loading">
      <p class="flex flex-1 items-center justify-center in">
        <i class="i-ic-outline-trending-up"></i>
        <ui-price :amount="income" size="1.3rem" color="var(--text-200)"></ui-price>
      </p>
      <p class="separator"></p>
      <p class="flex flex-1 items-center justify-center out">
        <i class="i-ic-outline-trending-down"></i>
        <ui-price :amount="expense" size="1.3rem" color="var(--text-200)"></ui-price>
      </p>
    </section>
    <Spinner v-else />
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useTransactionStore } from "@/stores/transactions";
import type { Transaction } from "~/types";

const transactionStore = useTransactionStore();
const { currency, loading } = storeToRefs(transactionStore);

const props = defineProps<{ transactions: Transaction[] }>();

const income = computed(() => getIncomeSum(props.transactions));
const expense = computed(() => getExpenseSum(props.transactions));
</script>
<style lang="scss" scoped>
.card {
  height: 48px;
  padding: 4px;
}
.separator {
  height: 2em;
  border-left: 1px solid var(--border-100);
  flex: 0;
}

i {
  margin-right: 8px;
}

.in {
  color: var(--color-success);
}

.out {
  color: var(--color-danger);
}

.hdr {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

p {
  color: var(--text-200);
}
</style>
