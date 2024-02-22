<template>
  <VitePwaManifest />
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


.slide-top-enter-active,
.slide-top-leave-active {
  transition: all 0.2s ease-in-out;
}
.slide-top-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}
.slide-top-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

body {
  position: absolute;
  inset: 0;
  font-family: "Roboto", sans-serif;

  font-weight: 400;
  line-height: 1.4;
  color: var(--text-200);
  background-color: var(--bg-100);
  touch-action: pan-x pan-y;
}

</style>
