<template>
  <main>
    <header >
      <div class="page flex p-2 items-center">
        <span>Household HQ</span>
        <span class="ml-auto text-xs">{{ VERSION }}</span>
        <div class="ml-5 flex gap-2 items-center">
          <ui-theme-toggle v-model="themeBool" />
        </div>
      </div>
    </header>

    <div class="page page-wrapper">
      <slot />
    </div>
   
    <footer></footer>
    <div class="notification-drawer">
      <TransitionGroup name="slide">
        <div v-for="notif in notifications" :key="notif.created.toISOString()">
          <ui-notification :notification="notif" />
        </div>
      </TransitionGroup>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { VERSION } from '@/_version';
import { useNotifications } from "@/composables/useNotifications";

const { notifications } = useNotifications();

const { theme, isDark, toggle } = useTheme()
const themeBool = ref(isDark.value)

watch(themeBool, ((_) => toggle()))

</script>

<style scoped lang="css">

.page {
  width: min(100% - .7rem, 960px);
  margin-inline: auto;
}

main {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

header {
  background-color: var(--primary-100);
  color: var(--text-over-primary);
  /* box-shadow: 0px 5px 5px var(--shadow-100); */
}

footer {
  width: 100%;
  margin-top: auto;
  background-color: var(--bg-300);
  color: var(--text-200);
  font-style: italic;
  font-size: x-small;
  padding: 2rem .5rem;
  display: flex;
  align-items: center;
}

.version {
  font-style: italic;
  margin-left: auto;
  /* filter: brightness(0.5); */
}

main {
  /* position: relative; */
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-drawer {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: .5rem;
  top: .5rem;
  right: .5rem;
  max-width: 70%;
}

.page-wrapper {
  flex: 1;
}
</style>