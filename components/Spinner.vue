<template>
  <div>
    <div v-if="name === 'roller'" class="lds-roller">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div v-else-if="name === 'spinner'" class="spinner"></div>
    <div v-else class="lds-ellipsis">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
type Spinner = "roller" | "ellipsis" | "spinner";
defineProps<{
  name?: Spinner;
}>();
</script>
<style lang="css" scoped>
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spinner {
  width: 1rem;
  aspect-ratio: 1;
  border: 2px solid var(--color-font-light);
  border-radius: 50%;
  border-right: none;
  border-top: none;
  animation: rotate 0.7s infinite linear;
}
</style>
