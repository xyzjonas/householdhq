<template>
  <section class="card flex flex-col gap-2 overflow-y-auto">
    <home-portfolio-group
      v-for="group in groups"
      :key="group.type"
      :group="group"
    />
  </section>
</template>

<script setup lang="ts">
const { data } = useHomePortfolio();

const groups = computed(() => data.value?.groups ?? []);
</script>
