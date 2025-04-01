<template lang="">
  <div
    class="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
  >
    <category-card
      :category="category"
      v-for="category in categories"
      class="min-h-[5rem]"
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
