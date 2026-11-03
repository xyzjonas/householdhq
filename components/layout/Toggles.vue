<template>
  <div class="flex items-center gap-2">
    <ui-theme-toggle v-model="themeBool" />
    <ui-button
      :icon="drawer ? 'i-ic-baseline-close' : 'i-ic-outline-menu'"
      squared
      flat
      class="text-xl"
      @click="drawer = !drawer"
    />
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";

const { isDark, toggle } = useTheme();
const themeBool = ref(isDark.value);

watch(themeBool, (_) => toggle());

const drawer = useLocalStorage("drawer-open", false);
</script>

<style lang="scss" scoped></style>
