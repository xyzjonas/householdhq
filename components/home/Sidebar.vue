<template>
  <aside v-if="hasPortfolio" class="flex flex-col flex-1 gap-2 min-w-[280px]">
    <home-portfolio-card class="flex-1" />
    <home-projects-card />
  </aside>
</template>

<script setup lang="ts">
// the sidebar only makes sense for people who track a portfolio
const { data } = useHomePortfolio();

const hasPortfolio = computed(() => (data.value?.groups.length ?? 0) > 0);
</script>
