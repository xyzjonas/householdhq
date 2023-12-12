<template>
  <div class="balance-row">
    <div class="balance-row-hdr">
      <p>{{ $t("balance") }}</p>
      <ui-price :amount="balanceSums.reduce((a, b) => a + b, 0).toString()" :currency="currency" />
    </div>
    <BalanceItem
      v-for="(bal, index) in sources"
      :source="bal"
      v-model="balanceSums[index]"
      :max="max"
      class="balance-row-item"
    />
    <NuxtLink to="/sources" class="ml">. . .</NuxtLink>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useTransactionStore } from "@/stores/transactions";
import type { Source } from "@/stores/types";

const { currency } = storeToRefs(useTransactionStore());

const props = defineProps<{
  sources: Source[];
}>();

const balanceSums = ref<number[]>([]);

const max = computed(() => {
  let max = 0;
  props.sources.forEach((source) => {
    if (source.sum && source.sum > max) {
      max = source.sum;
    }
  });
  return max;
});

const total = computed(() => {
  let sum = 0;
  props.sources.forEach((source) => {
    if (source.sum) {
      sum += source.sum;
    }
  });
  return sum;
});
</script>
<style lang="scss" scoped>
.balance-row {
  &-hdr {
    p {
      text-transform: uppercase;
      font-size: large;
    }
    font-weight: 1000;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-primary-light-1);
  }
}
</style>
