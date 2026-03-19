<template>
  <div class="flex">
    <div class="slideOne" @click="toggle">
      <input
        disabled
        v-model="modelValue"
        type="checkbox"
        id="slideOne"
        name="check"
      />
      <label disabled for="slideOne"></label>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean;
}>();
const modelValue = defineModel<boolean>();

const toggle = () => {
  if (props.disabled) return;
  modelValue.value = !modelValue.value;
};
</script>
<style lang="scss" scoped>
button {
  margin-left: 3px;
}
</style>
