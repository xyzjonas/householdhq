<template>
  <button :class="clazz" :disabled="disabled || loading">
    <spinner name="ellipsis" v-if="loading" />
    <i v-if="!loading && icon" :class="icon"></i>
    <slot v-if="!loading" />
    <i v-if="!loading && iconLeft" :class="iconLeft"></i>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  loading?: boolean;
  icon?: string;
  iconLeft?: string;
  iconSize?: string;
  outlined?: boolean;
  width?: string;
  height?: string;
  disabled?: boolean;
  rounded?: boolean;
  squared?: boolean;
  link?: boolean;
  flat?: boolean;
  breakLine?: boolean;
  color?: "primary" | "secondary" | "light" | "success" | "danger";
}>();

const clazz = computed(() => {
  let cls = "ui-btn transition-all text-nowrap";
  if (props.rounded) {
    cls += " rounded";
  } else if (props.squared) {
    cls += " squared";
  }

  if (props.color) {
    cls += ` ${props.color}`;
  } else {
    cls += " secondary";
  }

  if (props.link) {
    cls += " link";
  }

  if (!props.flat) {
    cls += " shadow hover:shadow-md transition";
  } else {
    cls += " flat";
  }

  if (props.outlined) {
    cls += " outlined";
  }

  return cls;
});

const w = computed(() => props.width ?? "fit-content");
const h = computed(() => {
  if (props.rounded || props.squared) {
    return w.value;
  }

  if (props.height) {
    return props.height;
  }
});

const iSize = computed(() => props.iconSize);
</script>

<style lang="scss" scoped>
i {
  font-size: v-bind("iSize");
}

@mixin common() {
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  border-radius: 0.4rem;
  gap: 0.4rem;
  width: v-bind("w");
  height: v-bind("h");
  border: 1px solid transparent;
  user-select: none;
  padding: 0.45rem 0.75rem;
  text-transform: capitalize;
  font-weight: 600;
  letter-spacing: 0.01em;
  // line-height: 1;

  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;
}

.primary {
  background-color: var(--primary-100);
  border-color: var(--primary-100);
  color: var(--text-over-primary);

  &:hover {
    background-color: color-mix(in srgb, var(--primary-100) 90%, white);
  }
}

.light {
  background-color: var(--bg-200);
  border-color: var(--border-100);
  color: var(--text-100);

  &:hover {
    background-color: var(--bg-300);
  }
}

.secondary {
  background-color: var(--bg-100);
  border-color: var(--border-100);
  color: var(--text-100);

  &:hover {
    background-color: var(--bg-200);
    border-color: var(--border-200);
  }
}

.danger {
  background-color: var(--color-danger);
  color: var(--text-over-danger);
  border-color: var(--color-danger);

  &:hover {
    background-color: color-mix(in srgb, var(--color-danger) 90%, white);
  }
}

.link {
  background-color: transparent !important;
  border-color: transparent !important;
  color: var(--text-100);

  &:hover {
    background-color: var(--bg-200) !important;
  }
}

.success {
  background-color: var(--color-success);
  border-color: var(--color-success);
  color: var(--bg-200);

  &:hover {
    background-color: color-mix(in srgb, var(--color-success) 88%, white);
  }
}

.squared {
  aspect-ratio: 1;
  padding-block: 0 !important;
}

.rounded {
  border-radius: 50% !important;
  aspect-ratio: 1;
  padding-block: 0 !important;
}

.flat {
  background-color: transparent !important;
  border-color: transparent !important;
  color: var(--text-100);

  &:hover {
    background-color: var(--bg-300) !important;
  }
}

.ui-btn {
  @include common();
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px var(--bg-100),
      0 0 0 4px color-mix(in srgb, var(--primary-100) 36%, transparent);
  }
}

button[disabled] {
  background-color: var(--bg-300) !important;
  color: #777 !important;
  border: 1px solid transparent;
  opacity: 0.55;
  pointer-events: none;
  transform: none !important;
  box-shadow: none !important;

  i {
    color: #777 !important;
  }
}
</style>
