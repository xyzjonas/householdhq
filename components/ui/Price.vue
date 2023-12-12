<template>
  <div class="amount">
    <span>{{ displayedAmount }}</span>
    <span v-if="amounAsNumber != undefined" style="font-size: medium; margin-left: 2px">{{ curr }}</span>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useTransactionStore } from "@/stores/transactions";

const props = defineProps({
  amount: {
    type: [String, Number],
    default: "N/A",
    required: true,
  },
  size: {
    type: String,
    default: "x-large",
  },
});

const { currency } = storeToRefs(useTransactionStore());

// num = new Intl.NumberFormat('hi-IN', { style: 'currency', currency: 'INR' }).format(number);
const curr = computed(() => {
  if (currency.value === "CZK") {
    return "Kč";
  }
  return currency.value;
});

const amounAsNumber = computed(() => {
  if (typeof props.amount === "number") {
    return props.amount;
  }
  return parseInt(props.amount);
});

const displayedAmount = computed(() => {
  if (amounAsNumber.value) {
    return new Intl.NumberFormat().format(amounAsNumber.value);
  }
  return props.amount;
});
</script>
<style lang="scss" scoped>
.amount {
  font-size: v-bind("size");
  font-family: sans-serif;
}
</style>
