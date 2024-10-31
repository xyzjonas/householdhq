<template>
  <main>
    <header>
      <div class="page flex p-2 items-center">
        <span>Household HQ</span>
        <span class="ml-auto text-xs">{{ VERSION }}</span>
        <ClientOnly>
          <div class="ml-5 flex items-center">
            <ui-theme-toggle v-model="themeBool" />
            <ui-login-toggle />
            <!-- <ui-button
              :icon="drawer ? 'i-ic-baseline-close' : 'i-ic-outline-menu'"
              squared
              color="primary"
              @click="drawer = !drawer"
            /> -->
          </div>
        </ClientOnly>
      </div>
    </header>

    <ui-drawer v-model="drawer" />

    <div class="page page-wrapper">
      <slot />
    </div>

    <!-- <footer></footer> -->
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

const { notifications } = useNotifications();

const { theme, isDark, toggle } = useTheme();
const themeBool = ref(isDark.value);

watch(themeBool, (_) => toggle());

const drawer = ref(false);
</script>

<style scoped lang="css">
.page {
  width: min(100% - 0.7rem, 960px);
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
  padding: 2rem 0.5rem;
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
  gap: 0.5rem;
  bottom: 0;
  width: 100%;
}

.page-wrapper {
  flex: 1;
}
</style>
