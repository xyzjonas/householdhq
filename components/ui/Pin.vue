<template>
  <div
    class="pin"
    :class="{
      pin: true,
      clickable,
      small: size === 'small',
    }"
  >
    <slot name="start"></slot>
    <span>{{ text }}</span>
    <slot name="end"></slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string;
  color?: string | null;
  clickable?: boolean;
  size?: "small" | "normal";
}>();

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
  padding: 0.1rem 0.3rem;
  border-radius: 2rem;
  transition: filter 0.1s ease-in-out;

  background-color: v-bind("bg");
  color: v-bind("textColor");
}

.small {
  font-size: x-small;
  font-weight: 500;
}

.clickable {
  cursor: pointer;
  &:hover {
    filter: brightness(1.2);
  }
}
</style>
