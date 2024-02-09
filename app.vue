<template>
  <VitePwaManifest />
  <div class="noise-background" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup lang="ts">
// import VueApexCharts from "vue3-apexcharts";

const nuxtApp = useNuxtApp();

// nuxtApp.vueApp.use(VueApexCharts);
</script>
<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s;
}
.slide-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.noise-background {
  position: absolute;
  inset: 0;
  z-index: -100;
  opacity: 0.6;
  mix-blend-mode: overlay;
  background-image: url("@/assets/noise.webp");
  overflow: auto;
}

body {
  min-height: 100vh;
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  line-height: 1.4;
  color: var(--color-font-light);
  background-color: var(--color-background-dark);
  touch-action: pan-x pan-y;
}
#__nuxt {
  position: relative;
  min-height: 100vh;
  /* position: absolute; */
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
