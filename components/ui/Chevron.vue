<template>
  <ui-button
    icon="i-ic-chevron-left"
    rounded
    link
    :style="model ? 'transform: rotate(90deg);' : 'transform: rotate(-90deg);'"
    @click="model = !model"
  />
</template>
<script setup lang="ts">
const model = defineModel();
</script>
