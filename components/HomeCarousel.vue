<template>
  <div class="carousel">
    <!-- EXPENSES & INCOMES -->
    <BarGraph :items="data" @filter="(tagId: number) => $emit('filter', tagId)" :expand="expandGraph">
      <slot></slot>
    </BarGraph>
    <!-- <BarGraph v-else :items="topExpenses" @filter="(tagId: number) => $emit('filter', tagId)" /> -->
  </div>
  <div class="center my-1">
    <div class="toggle-bar m-1">
      <a @click="model = 0" :class="`bar-item ${model === 0 ? 'active' : ''}`">{{ $t("expenses") }}</a>
      <a @click="model = 1" :class="`bar-item ${model === 1 ? 'active' : ''}`">{{ $t("incomes") }}</a>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { CategoryWithSum } from "@/types";

defineEmits(["filter"]);

// = selected 'tab'
const model = defineModel<number>();

const props = defineProps<{
  expenses: CategoryWithSum[];
  incomes: CategoryWithSum[];
  expandGraph?: boolean;
}>();

// const item = ref(0);

const data = computed(() => (model.value === 1 ? props.incomes : topExpenses.value));

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
</style>
