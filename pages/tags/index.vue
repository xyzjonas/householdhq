<template lang="">
    <div class="container">
        <div v-for="category in categories.value">
            <component :is="SourceRow" :source="source"></component>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useCategoriesStore } from "@/stores/categories"
import { storeToRefs } from "pinia";

const { categories } = storeToRefs(useCategoriesStore());

const SourceRow = resolveComponent('SourceRow')
</script>
<style lang="">
    
</style>