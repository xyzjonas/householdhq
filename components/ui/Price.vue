<template>
  <div class="amount">
    <h1>{{ displayedAmount }}</h1>
    <span v-if="amounAsNumber != undefined" class="currency">{{ curr }}</span>
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
  color: {
    type: String,
    default: "var(--text-100)",
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

const currSize = computed(() => {
  if (!props.size) {
    return "small";
  }
  const mapped = {
    "x-large": "medium",
    small: "x-small",
  }[props.size];

  if (mapped) {
    return mapped;
  }

  return props.size;
});
</script>
<style lang="scss" scoped>
.amount {
  font-weight: 200;
  display: flex;
  align-items: center;
  gap: 0.1rem;
  color: v-bind("color");
}

.currency {
  --size: v-bind("currSize");
  font-size: calc(0.7 * var(--size));
  font-weight: 400;
  font-family: "Roboto Slab", serif;
}

h1 {
  font-weight: 400;
  font-size: v-bind("size");
}
</style>
