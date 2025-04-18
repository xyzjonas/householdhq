<template>
  <div :class="clazz">
    <label v-if="label" :for="uniqueId">{{ label }}</label>
    <input
      ref="inputRef"
      :id="uniqueId"
      :value="modelValue"
      @input="emitValue(($event.target as HTMLInputElement).value)"
      :type="type"
      :name="label"
      :required="required"
      :inputmode="inputmode ?? 'text'"
    />
  </div>
</template>
<script lang="ts" setup>
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  modelValue: any;
  label?: string;
  type?: string;
  inputmode?: HTMLAttributes["inputmode"];
  required?: boolean;
  size?: ["md", "lg"];
}>();

const clazz = computed(() => {
  return `input-box input-group-${props.size ?? "md"}`;
});

const emit = defineEmits(["update:modelValue"]);
function emitValue(value: any) {
  if (props.type === "number") {
    emit("update:modelValue", parseFloat(value));
  } else {
    emit("update:modelValue", value);
  }
}

const uniqueId = Math.random().toString(16).substring(2);
const inputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (props.modelValue != undefined && props.modelValue !== "") {
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

.input-group-md {
  @include custom_components.input-group(10px, 16px, 10px);
}

.input-group-lg {
  @include custom_components.input-group(16px, 16px, 10px);
}

input {
  width: 100%;
  font-size: medium;
}
</style>
