<template>
  <div class="input-group">
    <label :for="uniqueId">{{ label }}</label>
    <select
      ref="inputRef"
      :id="uniqueId"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      :required="required"
    >
      <slot />
    </select>
    <!-- <select v-model.number="modelValue.sourceId">
            <option
                v-for="source in allSources"
                :key="'option-source-' + source.id"
                :value="source.id"
            >{{ source.name }}</option>
        </select> -->
  </div>
</template>
<script lang="ts" setup>
const props = defineProps<{
  modelValue: any;
  label: string;
  required?: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);

const uniqueId = Math.random().toString(16).substring(2);
const inputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (props.modelValue) {
    document.querySelector(`[for='${inputRef.value?.id}']`)?.classList?.add("active");
  }

  inputRef.value?.addEventListener("focus", () => {
    document.querySelector(`[for='${inputRef.value?.id}']`)?.classList?.add("active");
  });

  inputRef.value?.addEventListener("focusout", () => {
    if (!inputRef.value?.value) {
      document.querySelector(`[for='${inputRef.value?.id}']`)?.classList?.remove("active");
    }
  });
});
</script>
<style lang="scss" scoped>
@import "@/assets/css/base";
@import "@/assets/css/custom_components";
.input-group {
  @include input-group(10px, 16px, 10px);
}

select {
  width: 100%;
  font-size: medium;
}
</style>
