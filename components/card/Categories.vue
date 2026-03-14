<template>
  <div class="legend card font-sans">
    <div
      v-for="item in items
        .sort((a, b) => b.sum - a.sum)
        .filter((it) => it.sum > 10)"
      :key="item.id"
      class="legend-content-item relative overflow-hidden p-5 min-w-50"
      @click="selectedCategoryId = item.id"
    >
      <span
        :class="[
          'circle-sm',
          'mr-1',
          selectedCategoryId === item.id ? 'border-solid border-2' : '',
        ]"
        :style="`background-color: ${item.color};`"
      ></span>
      <span class="absolute inset-0 opacity-[0.1] left-[2]"></span>
      <span class="mr-1">{{ item.name }}</span>
      <ui-price :amount="item.sum" size="medium" class="ml-auto mr-2" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryWithSum } from "~/types";

const selectedCategoryId = defineModel<number>("selectedCategoryId", {
  default: -1,
});

defineProps<{
  items: CategoryWithSum[];
}>();
</script>

<style lang="scss" scoped>
section {
  width: 100%;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &-content {
    display: flex;
    gap: 1.2rem;
    flex-wrap: wrap;
    justify-content: center;

    &-item {
      display: flex;
      align-items: center;
      gap: 0.2rem;
      font-size: normal;
      border: 1px solid var(--border-100);
      background-color: var(--bg-200);
      padding: 2px 5px;
      border-radius: 2rem;
      transition: filter 0.1s ease-in-out;

      &:hover {
        font-weight: 500;
      }
    }
  }
}
</style>
