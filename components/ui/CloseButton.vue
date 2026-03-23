<template>
  <ui-button
    icon="i-ic-baseline-close"
    flat
    squared
    @click="model = !model"
    type="button"
  />
</template>
<script setup lang="ts">
const model = defineModel();
</script>
