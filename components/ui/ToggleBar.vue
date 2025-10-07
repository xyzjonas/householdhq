<template>
  <div class="toggle-bar">
    <a
      v-for="(option, index) in options"
      @click="onClick(index)"
      :class="`bar-item ${modelValue === index ? 'active' : ''}`"
      >{{ option }}</a
    >
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  options: string[];
  itemWidth?: string;
  disabled?: boolean;
}>();
const modelValue = defineModel();

const onClick = (index: number) => {
  if (!props.disabled) {
    modelValue.value = index;
  }
};
</script>

<style lang="scss" scoped>
.bar-item {
  --w: v-bind("itemWidth");
  width: calc(var(--w, 100%));
}
</style>
