<template>
  <ui-button
    :icon="icon"
    squared
    color="primary"
    @click="modelValue = !modelValue"
  />
</template>
<script setup lang="ts">
const modelValue = defineModel<boolean>();

const color = computed(() => (modelValue.value ? "black" : "white"));
const bgcolor = computed(() => (modelValue.value ? "white" : "black"));

const icon = computed(() =>
  modelValue.value ? "i-ic-round-dark-mode" : "i-ic-baseline-wb-sunny"
);
</script>
