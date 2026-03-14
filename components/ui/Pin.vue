<template>
  <div
    class="pin"
    :class="[
      'pin',
      'clickable',
      size === 'small' ? 'small' : '',
      clickable ? 'clickable' : '',
      size === 'normal' ? 'normal' : '',
    ]"
    :style="{
      backgroundColor: bg,
      borderColor: border,
      color: textColor,
    }"
  >
    <slot name="start"></slot>
    <span>{{ text }}</span>
    <slot name="end"></slot>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    text: string;
    color?: string | null;
    clickable?: boolean;
    size?: "small" | "normal";
  }>(),
  {
    clickable: false,
    size: "normal",
  },
);

const bg = computed(() => props.color ?? "transparent");
const border = computed(() => props.color ?? "var(--border-100)");
const textColor = computed(() => {
  if (!props.color) {
    return "var(--text-100)";
  }

  return shouldInvert(props.color) ? "black" : "white";
});
</script>

<style lang="scss" scoped>
.pin {
  width: fit-content;
  min-width: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  font-size: small;
  border: 1px solid v-bind("border");
  border-radius: 2rem;
  transition: filter 0.1s ease-in-out;

  background-color: v-bind("bg");
  color: v-bind("textColor");
}

.small {
  font-size: x-small;
  font-weight: 500;
  padding: 1px 4px;
}

.normal {
  font-weight: 500;
  padding: 6px 12px;
}

.clickable {
  cursor: pointer;
  &:hover {
    filter: brightness(1.2);
  }
}
</style>
