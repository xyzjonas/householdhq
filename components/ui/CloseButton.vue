<template>
  <ui-button
    icon="i-ic-baseline-close"
    flat
    squared
    type="button"
    @click="model = !model"
  />
</template>
<script setup lang="ts">
const model = defineModel<boolean>();
</script>
