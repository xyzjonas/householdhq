<template>
  <div class="card">
    <div
      class="uppercase dark:text-gray-4 light:text-gray-6 justify-between flex"
    >
      <span> {{ selectedCategory?.name ?? "month summary" }} </span>
      <slot name="header-right"></slot>
    </div>
    <div class="p-5 flex gap-15 flex-wrap justify-center">
      <BarGraph
        :items="data"
        :expand="expandGraph"
        v-model:selected-category-id="selectedCategoryId"
        :class="[
          'min-w-xs',
          'max-h-xs',
          selectedCategoryId >= 0 ? 'w-full' : '',
        ]"
      >
        <slot></slot>
      </BarGraph>
      <div
        v-if="selectedCategoryId < 0"
        class="flex flex-col flex-1 min-w-60 justify-center gap-5"
      >
        <span
          class="row-hover flex items-center justify-between"
          @click="tabIndex = 1"
        >
          <div class="flex items-center gap-3 capitalize">
            <i v-if="tabIndex === 1" class="i-ic-chevron-right"></i
            >{{ $t("incomes") }}
          </div>
          <div class="text-lg font-semibold">{{ totalIncome }}</div>
        </span>
        <hr class="my-0" />
        <span
          class="row-hover flex items-center justify-between"
          @click="tabIndex = 2"
        >
          <div class="flex items-center gap-3 capitalize">
            <i v-if="tabIndex === 2" class="i-ic-chevron-right"></i>
            {{ $t("expenses") }}
          </div>
          <div class="text-lg font-semibold">{{ totalExpenses }}</div>
        </span>
        <hr class="my-0" />
        <span class="flex justify-between p-2 capitalize">
          <div>{{ $t("net") }}</div>
          <div
            :class="[
              netTotal.startsWith('-') ? 'text-red-500' : 'text-positive',
              'text-lg font-semibold',
            ]"
          >
            {{ netTotal }}
          </div>
        </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { CategoryWithSum } from "@/types";

const selectedCategoryId = defineModel<number>("category", { default: -1 });

const selectedCategory = computed(() => {
  return props.expenses.find((c) => c.id === selectedCategoryId.value);
});

const tabIndex = defineModel<number>("tabindex", { default: 2 });

const props = defineProps<{
  expenses: CategoryWithSum[];
  incomes: CategoryWithSum[];
  expandGraph?: boolean;
}>();

const data = computed(() =>
  tabIndex.value === 1 ? props.incomes : topExpenses.value,
);

const topExpenses = computed(() => {
  if (props.expenses.length > 5) {
    return props.expenses
      .filter((e) => e.sum > 100)
      .sort((a, b) => b.sum - a.sum);
  }
  return props.expenses;
});

const expensesSum = computed(() =>
  props.expenses.reduce((acc, curr) => acc + curr.sum, 0),
);
const totalExpenses = computed(() =>
  new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
  }).format(expensesSum.value),
);

const incomeSum = computed(() =>
  props.incomes.reduce((acc, curr) => acc + curr.sum, 0),
);
const totalIncome = computed(() =>
  new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
  }).format(incomeSum.value),
);

const netTotal = computed(() => {
  const net = incomeSum.value - expensesSum.value;
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    signDisplay: "always",
  }).format(net);
});
</script>
<style lang="scss" scoped>
h3 {
  text-transform: uppercase;
}

.circle {
  width: 10px;
  height: 10px;
  border: solid 2px #fff;
  border-radius: 0.5em;
  margin: 7px;
  transition: background-color linear 0.5s;
}

.circle.selected {
  background-color: #fff;
}

.border-left {
  padding-left: 1em;
  border-left: 1px solid var(--color-grey-dark-2);
  padding-right: 1em;
  border-right: 1px solid var(--color-grey-dark-2);
}
</style>
