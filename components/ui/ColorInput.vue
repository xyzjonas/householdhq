<template>
  <div class="color-input-wrap">
    <div class="color-input-shell">
      <input
        :id="uniqueId"
        class="color-input"
        type="color"
        :value="colorValue"
        :name="label"
        :aria-label="label"
        :title="label"
        :required="required"
        @input="emitValue(($event.target as HTMLInputElement).value)"
      />
      <span class="color-value">{{ colorValue.toUpperCase() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: string | null;
  label?: string;
  required?: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);

const uniqueId = Math.random().toString(16).substring(2);

const colorValue = computed(() => {
  if (!props.modelValue || !props.modelValue.trim()) {
    return "#4f46e5";
  }

  return props.modelValue;
});

const emitValue = (value: string) => {
  emit("update:modelValue", value);
};
</script>

<style lang="scss" scoped>
.color-input-wrap {
  width: 100%;
  display: flex;
}

.color-input-shell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  width: 100%;
  min-height: 42px;
  border: 1px solid var(--border-100);
  border-radius: var(--input-border-radius);
  background-color: var(--bg-200);
  padding: 2px;
  transition: border-color 0.2s ease-in-out;

  &:focus-within {
    border-color: var(--primary-100);
  }
}

.color-input {
  appearance: none;
  -webkit-appearance: none;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: 1px solid var(--border-100);
  border-radius: 6px;
}

.color-input::-moz-color-swatch {
  border: 1px solid var(--border-100);
  border-radius: 6px;
}

.color-value {
  font-size: 0.86rem;
  letter-spacing: 0.08em;
  color: var(--text-100);
  line-height: 1;
  user-select: text;
}
</style>
