<template>
  <ui-button
    icon="i-ic-chevron-left"
    rounded
    link
    :style="model ? 'transform: rotate(90deg);' : 'transform: rotate(-90deg);'"
    @click="onClick"
  />
</template>
<script setup lang="ts">
const props = defineProps<{ readonly?: boolean }>();
const model = defineModel();

const onClick = () => {
  if (props.readonly) {
    return;
  }
  model.value = !model.value;
};
</script>
