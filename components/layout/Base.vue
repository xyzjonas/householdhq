<template>
  <main>
    <header>
      <div class="page flex items-center justify-between overflow-hidden px-2">
        <div class="flex items-center">
          <div class="flex-col p-2">
            <span class="line-height-none">Household HQ</span>
            <span class="text-xs opacity-[0.8]">{{ VERSION }}</span>
          </div>
          <!-- <span class="text-xs opacity-[0.8]">{{ VERSION }}</span> -->
          <span class="h-[57px]"></span>
        </div>
        <ClientOnly>
          <div class="ml-auto flex items-center">
            <ui-theme-toggle v-model="themeBool" />
            <ui-button
              :icon="drawer ? 'i-ic-baseline-close' : 'i-ic-outline-menu'"
              squared
              color="primary"
              flat
              @click="drawer = !drawer"
              class="text-xl"
            />
          </div>
        </ClientOnly>
      </div>
    </header>

    <div class="flex flex-1" @click.capture="closeDrawer">
      <ui-drawer v-model="drawer" overlay />
      <div class="flex-1 px-2 mx-auto max-w-[1024px]">
        <slot />
      </div>
    </div>

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
import { VERSION } from "@/_version";
import { useNotifications } from "@/composables/useNotifications";
import { useLocalStorage, useWindowSize } from "@vueuse/core";

const { notifications } = useNotifications();

const { theme, isDark, toggle } = useTheme();
const themeBool = ref(isDark.value);

watch(themeBool, (_) => toggle());

const { width } = useWindowSize();
const drawer = useLocalStorage("drawer-open", true);
const closeDrawer = () => {
  // see breakpoints in base.scss
  if (width.value <= 900) {
    drawer.value = false;
  }
};
</script>

<style scoped lang="css">
main {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

header {
  background-color: var(--primary-100);
  color: var(--text-over-primary);
  z-index: 1;
}

footer {
  width: 100%;
  margin-top: auto;
  background-color: var(--bg-300);
  color: var(--text-200);
  font-style: italic;
  font-size: x-small;
  padding: 2rem 0.5rem;
  display: flex;
  align-items: center;
}

.version {
  font-style: italic;
  margin-left: auto;
}

.notification-drawer {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  top: 0;
  width: 100%;
  z-index: 11;
}

.page-wrapper {
  flex: 1;
}
</style>
