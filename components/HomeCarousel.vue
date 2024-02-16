<template>
  <div>
    <!-- EXPENSES & INCOMES -->
    <section>
      <BarGraph v-if="item === 1" :items="incomes" @filter="(tagId: number) => $emit('filter', tagId)" />
      <BarGraph v-else :items="topExpenses" @filter="(tagId: number) => $emit('filter', tagId)" />
    </section>
  </div>
  <div class="center my-2">
    <div class="toggle-bar m-1">
      <a @click="item = 0" :class="`bar-item ${item === 0 ? 'active' : ''}`">{{ $t("expenses") }}</a>
      <a @click="item = 1" :class="`bar-item ${item === 1 ? 'active' : ''}`">{{ $t("incomes") }}</a>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Source, TagWithSum } from "@/stores/types";

defineEmits(["filter"]);

const props = defineProps<{
  expenses: TagWithSum[];
  incomes: TagWithSum[];
}>();

const item = ref(0);

const topExpenses = computed(() => {
  if (props.expenses.length > 5) {
    return props.expenses
    .filter(e => e.sum > 0)
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
