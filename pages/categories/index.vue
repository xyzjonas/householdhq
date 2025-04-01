<template lang="">
  <div
    class="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
  >
    <colored-row
      v-for="category in categories"
      :link="`/categories/${category.id}`"
      :title="category.name"
      :color="category.color"
      class="aspect-ratio-[1.5]"
    />
  </div>
</template>
<script setup lang="ts">
import { useCategoriesStore } from "@/stores/categories";
import { storeToRefs } from "pinia";

const store = useCategoriesStore();

const { categories } = storeToRefs(store);

if (categories.value.length === 0) {
  store.fetchCategories();
}
</script>
<style lang=""></style>
