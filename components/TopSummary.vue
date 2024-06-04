<template>
  <div class="card my center">
    <section class="hdr" v-if="!loading">
      <p class="in">
        <i class="fa-solid fa-arrow-trend-up"></i>
        {{ new Intl.NumberFormat().format(income) ?? "N/A" }}
        {{ income ? currency : "" }}
      </p>
      <p class="separator"></p>
      <p class="out">
        <i class="fa-solid fa-arrow-trend-down"></i>
        {{ new Intl.NumberFormat().format(expense) ?? "N/A" }}
        {{ expense ? currency : "" }}
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
  border-left: 1px solid var(--color-border-dark);
  flex: 0;
}

p {
  font-weight: 1000;
}

i {
  margin-right: 8px;
}

.in {
  color: var(--color-success);
  text-align: center;
  flex: 1;
}

.out {
  color: var(--color-danger);
  text-align: center;
  flex: 1;
}

.hdr {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}
</style>
