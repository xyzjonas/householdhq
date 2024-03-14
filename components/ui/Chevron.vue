<template>
  <ui-button
    id="show-legend"
    icon="i-ic-chevron-left"
    rounded link
    width="1.5rem" height="1.5rem"
    :style="model ? 'transform: rotate(90deg);' : 'transform: rotate(-90deg);'"
    @click="model = !model"
  />
</template>
<script setup lang="ts">
const model = defineModel()
</script>