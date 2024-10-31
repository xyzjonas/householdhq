<template>
  <button :class="clazz" :disabled="disabled || loading">
    <spinner name="ellipsis" v-if="loading" />
    <i v-if="!loading && icon" :class="icon"></i>
    <slot v-if="!loading" />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  loading?: boolean;
  icon?: string;
  iconSize?: string;
  outlined?: boolean;
  width?: string;
  height?: string;
  disabled?: boolean;
  rounded?: boolean;
  squared?: boolean;
  link?: boolean;
  breakLine?: boolean;
  color?: "primary" | "secondary" | "light" | "success" | "danger";
}>();

const clazz = computed(() => {
  let cls = "ui-btn";
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

  if (props.outlined) {
    cls += " outlined"
  }

  return cls;
});

const w = computed(() => props.width ?? 'fit-content')
const h = computed(() => {
  if (props.rounded || props.squared) {
    return w.value;
  }

  if (props.height) {
    return props.height;
  }
})

const iSize = computed(() => props.iconSize)
</script>

<style lang="scss" scoped>
i {
  font-size: v-bind('iSize');  
}

@mixin common() {
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  border-radius: 0.3rem;
  gap: .3rem;
  width: v-bind("w");
  height: v-bind("h");
  border: 1px solid transparent;
  user-select: none;
  padding: .3rem .6rem;

  transition: 0.2s ease-in-out;
}

button:hover {
  cursor: pointer;
  filter: brightness(1.1);
}

.primary {
  background-color: var(--primary-100);
  border: 1px solid var(--primary-100);
  color: var(--text-over-primary);
}

.light {
  background-color: var(--bg-100);
  border: 1px solid var(--bg-300);
  color: var(--text-100);
}

.secondary {
  background-color: var(--secondary-100);
  border: 1px solid var(--secondary-100);
  color: var(--text-over-secondary);
}

.danger {
  background-color: var(--color-danger);
  color: var(--text-over-danger);
  border-color: var(--color-danger);
}

.link {
  background-color: transparent;
  border-color: transparent;
  color: var(--text-100);
  &:hover {
    background-color: var(--bg-300);
  }
}

.success {
  background-color: var(--color-success);
  border-color: var(--color-success);
  color: var(--bg-200);
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

.outlined {
  background-color: transparent;
  border: 1px solid var(--border-100) !important;
  color: var(--text-100);
}

.ui-btn {
  @include common();
}

// .ui-btn-outlined {
//   @include common();
//   background-color: var(--bg-200);
//   color: var(--text-100);

//   i {
//     color: var(--text-100) !important;
//   }

//   &:hover {
//     background-color: var(--bg-300);
//   }
// }

button[disabled] {
  background-color: var(--bg-300);
  color: #777;
  border: 1px solid transparent;
  filter: opacity(.5);
  pointer-events: none;
  i {
    color: #777 !important;
  }
}
</style>
