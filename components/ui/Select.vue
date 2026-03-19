<template>
  <div class="input-group">
    <label :for="uniqueId">{{ label }}</label>
    <select
      ref="inputRef"
      :id="uniqueId"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLSelectElement).value)
      "
      :required="required"
    >
      <slot />
    </select>
    <span class="select-chevron" aria-hidden="true" />
  </div>
</template>
<script lang="ts" setup>
const props = defineProps<{
  modelValue: any;
  label?: string;
  required?: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);

const uniqueId = Math.random().toString(16).substring(2);
const inputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (props.modelValue) {
    document
      .querySelector(`[for='${inputRef.value?.id}']`)
      ?.classList?.add("active");
  }

  inputRef.value?.addEventListener("focus", () => {
    document
      .querySelector(`[for='${inputRef.value?.id}']`)
      ?.classList?.add("active");
  });

  inputRef.value?.addEventListener("focusout", () => {
    if (!inputRef.value?.value) {
      document
        .querySelector(`[for='${inputRef.value?.id}']`)
        ?.classList?.remove("active");
    }
  });
});
</script>
<style lang="scss" scoped>
@use "@/assets/css/custom_components";

.input-group {
  @include custom_components.input-group(10px, 16px, 10px);

  // Chevron arrow indicator
  .select-chevron {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
    pointer-events: none;
    width: 7px;
    height: 7px;
    border-right: 2px solid var(--text-100);
    border-bottom: 2px solid var(--text-100);
    opacity: 0.45;
    transition: opacity 0.2s ease;
  }

  &:focus-within .select-chevron {
    opacity: 0.8;
  }
}

select {
  width: 100%;
  font-size: medium;
  cursor: pointer;

  // Strip all native browser chrome
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  // Theme-matched surface
  background-color: var(--bg-200);
  color: var(--text-100);
  border-radius: 8px;

  // Extra right padding to avoid text overlapping the chevron
  padding-right: 2.5em !important;

  &:focus {
    outline: none;
    border-color: var(--primary-100);
  }

  // Style options where browsers allow it
  option {
    background-color: var(--bg-200);
    color: var(--text-100);
  }
}
</style>
