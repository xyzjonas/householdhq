<template>
  <div class="toggle-bar">
    <a
      v-for="(option, index) in options"
      @click="onClick(index)"
      :class="`bar-item ${modelValue === index ? 'active' : ''}`"
    >
      <slot
        name="option"
        :option="option"
        :index="index"
        :active="modelValue === index"
      >
        {{ getOptionLabel(option) }}
      </slot>
    </a>
  </div>
</template>

<script setup lang="ts">
type ToggleBarOption = string | { label: string; [key: string]: unknown };

const props = defineProps<{
  options: ToggleBarOption[];
  itemWidth?: string;
  disabled?: boolean;
}>();
const modelValue = defineModel<number>();

defineSlots<{
  option(props: {
    option: ToggleBarOption;
    index: number;
    active: boolean;
  }): any;
}>();

const getOptionLabel = (option: ToggleBarOption) => {
  if (typeof option === "string") {
    return option;
  }

  return option.label;
};

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
