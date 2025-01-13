<template>
  <div class="carousel">
    <!-- EXPENSES & INCOMES -->
    <BarGraph :items="data" :expand="expandGraph" @filter="(id) => $emit('filter', id)">
      <slot></slot>
    </BarGraph>
  </div>
  <div class="center my-1">
    <div class="toggle-bar m-1">
      <a @click="modelValue = 0" :class="`bar-item ${modelValue === 0 ? 'active' : ''}`">{{ $t("expenses") }}</a>
      <a @click="modelValue = 1" :class="`bar-item ${modelValue === 1 ? 'active' : ''}`">{{ $t("incomes") }}</a>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { CategoryWithSum } from "@/types";

defineEmits(["filter"]);

const modelValue = defineModel<number>();

const props = defineProps<{
  expenses: CategoryWithSum[];
  incomes: CategoryWithSum[];
  expandGraph?: boolean;
}>();

const data = computed(() => (modelValue.value === 1 ? props.incomes : topExpenses.value));

const topExpenses = computed(() => {
  if (props.expenses.length > 5) {
    return props.expenses
    .filter(e => e.sum > 100)
    .sort((a, b) => b.sum - a.sum)
  }
  return props.expenses
})

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

.bar-item {
  width: 8rem;
}
</style>
