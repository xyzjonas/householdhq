<template>
  <button :class="clazz" :disabled="disabled || loading">
    <spinner v-if="loading" />
    <span v-if="!loading && icon" class="icon"><i :class="icon"></i></span>
    <slot v-if="!loading" />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  loading?: boolean;
  icon?: string;
  outlined?: boolean;
  width?: string;
  height?: string;
  disabled?: boolean;
  rounded?: boolean;
  link?: boolean;
  breakLine?: boolean;
  color?: "primary" | "secondary" | "light" | "success" | "danger";
}>();

const clazz = computed(() => {
  let cls = props.outlined ? "ui-btn-outlined" : "ui-btn";
  if (props.rounded) {
    cls += " rounded";
  }

  if (props.color) {
    cls += ` ${props.color}`;
  } else {
    cls += " secondary";
  }

  if (props.link) {
    cls += " link";
  }

  return cls;
});
</script>

<style lang="scss" scoped>
@mixin common() {
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  border-radius: 0.3rem;
  gap: .3rem;
  width: v-bind(width);
  height: v-bind(height);
  border: 1px solid transparent;

  transition: 0.2s ease-in-out;

  i {
    transform: translateY(0px);
  }
}

button:hover {
  cursor: pointer;
  filter: brightness(1.2);
}

.primary {
  background-color: var(--primary-100);
  border: 1px solid var(--primary-100);
  color: var(--text-100);
}

.light {
  background-color: var(--bg-100);
  border: 1px solid var(--bg-300);
  color: var(--text-100);
}

.secondary {
  background-color: var(--bg-300);
  border: 1px solid var(--bg-300);
  color: var(--text-100);
}

.danger {
  background-color: var(--color-danger);
  color: var(--text-100);
  border-color: var(--color-danger);
}

.link {
  background-color: transparent;
  border-color: transparent;
  &:hover {
    background-color: var(--bg-300);
  }
}

.success {
  background-color: var(--color-success);
  border-color: var(--color-success);
  color: var(--bg-200);
}

.rounded {
  border-radius: 50% !important;
}

.ui-btn {
  @include common();
}

.ui-btn-outlined {
  @include common();
  background-color: var(--bg-200);
  color: var(--text-100);

  i {
    color: var(--text-100) !important;
  }

  &:hover {
    background-color: var(--bg-300);
  }
}

button[disabled] {
  background-color: var(--bg-300);
  color: #777;
  border: 1px solid transparent;
  i {
    color: #777 !important;
  }
  cursor: auto !important;
}
</style>
