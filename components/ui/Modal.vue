<template>
  <transition name="page" mode="out-in">
    <div
      v-show="modelValue"
      class="modal-wrapper"
      @click.self="modelValue = false"
    >
      <div @click="() => false">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useScrollLock } from "@vueuse/core";

const modelValue = defineModel({ default: true });

const lock = useScrollLock(document);
lock.value = modelValue.value;

watch(modelValue, (modalOpened) => {
  if (modalOpened) {
    lock.value = true;
  } else {
    lock.value = false;
  }
});
</script>

<style lang="css" scoped>
.modal-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 10;
}
</style>
