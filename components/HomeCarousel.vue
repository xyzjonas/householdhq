<template>
  <div>
    <!-- EXPENSES & INCOMES -->
    <section v-if="item <= 1">
      <BarGraph :items="(graphContent as TagWithSum[])" @filter="(tagId) => $emit('filter', tagId)" />
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
  sources: Source[];
  targets: Source[];
}>();

const item = ref(0);

const graphContent = computed(() => {
  if (item.value === 1) {
    return props.incomes;
  }
  if (item.value === 2) {
    return props.sources;
  }
  if (item.value === 3) {
    return props.targets;
  }
  return props.expenses;
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

.chevron {
  background-color: #ffffff00;
}
.chevron.left {
  margin-right: 0.5em;
}

.chevron.right {
  margin-right: 0.5em;
}

.border-left {
  padding-left: 1em;
  border-left: 1px solid var(--color-grey-dark-2);
  padding-right: 1em;
  border-right: 1px solid var(--color-grey-dark-2);
}
</style>
