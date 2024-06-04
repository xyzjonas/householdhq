<template lang="">
    <div>
        <colored-row v-for="category in categories" :link="`/categories/${category.id}`" :title="category.name" :color="category.color" />
    </div>
</template>
<script setup lang="ts">
import { useCategoriesStore } from "@/stores/categories"
import { storeToRefs } from "pinia";


const store = useCategoriesStore()


const { categories } = storeToRefs(store);

if (categories.value.length === 0) {
    store.fetchCategories();
}

</script>
<style lang="">
    
</style>