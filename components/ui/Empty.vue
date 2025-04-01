<template>
  <section class="empty">
    <spinner v-if="loading" name="roller" />
    <section v-else class="flex flex-col items-center">
      <i class="text-3xl font-light" :class="icon"></i>
      <h1>{{ title }}</h1>
      <h2 class="text-gray-5" v-show="subtitle">{{ subtitle }}</h2>
    </section>
  </section>
</template>
<script setup lang="ts">
const props = defineProps<{
  loading?: boolean;
  icon?: string;
  title: string;
  subtitle?: string;
}>();
</script>
<style lang="scss" scoped>
@use "@/assets/css/base.scss";

.empty {
  // background-color: var(--color-primary-dark-2-rgb), 0.3);

  border-radius: 3px;

  padding: 16px;

  display: grid;
  gap: 8px;
  justify-content: center;
  align-content: center;
  width: 100%;
  text-align: center;

  @media only screen and (max-width: base.$bp-small) {
    height: 240px;
  }

  h1 {
    text-transform: uppercase;
  }
}
</style>
