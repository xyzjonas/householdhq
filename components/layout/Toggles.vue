<template>
  <div class="flex items-center gap-2">
    <ui-theme-toggle v-model="themeBool" />
    <ui-button
      :icon="drawer ? 'i-ic-baseline-close' : 'i-ic-outline-menu'"
      squared
      flat
      @click="drawer = !drawer"
      class="text-xl"
    />
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from "@/composables/useNotifications";
import { useLocalStorage, useWindowSize } from "@vueuse/core";

const { notifications } = useNotifications();

const { theme, isDark, toggle } = useTheme();
const themeBool = ref(isDark.value);

watch(themeBool, (_) => toggle());

const { width } = useWindowSize();
const drawer = useLocalStorage("drawer-open", false);
const onClickEverywhere = () => {
  // close the drawer in case of a 'mobile' device
  // see breakpoints in base.scss
  if (width.value <= 900) {
    drawer.value = false;
  }
};
</script>

<style lang="scss" scoped></style>
