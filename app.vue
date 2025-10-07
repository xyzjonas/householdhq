<template>
  <VitePwaManifest />
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup lang="ts">
import { useNotifications } from "@/composables/useNotifications";
const { notifications } = useNotifications();

useHead({
  script: [
    {
      textContent: `
      let myTheme = localStorage.getItem("theme");
      if (!myTheme) {
        const isDarkSchemePreferred = window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches ?? false;
        myTheme = isDarkSchemePreferred ? 'dark' : 'light';
        localStorage.setItem('theme', myTheme);
      }

      document.documentElement.setAttribute('data-theme', myTheme)
      `,
      tagPosition: "head",
      type: "text/javascript",
      defer: "false",
    },
  ],
});
</script>
<style>
html {
  overflow: scroll;
  overflow-x: hidden;
}

::-webkit-scrollbar {
  width: 4px;
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: var(--primary-100);
  min-height: 3rem;
}

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
  font-family: "Roboto", sans-serif;

  font-weight: 400;
  color: var(--text-200);
  background-color: var(--bg-100);
  touch-action: pan-x pan-y;

  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

* {
  margin: 0;
  padding: 0;
  font: inherit;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}
</style>
