<template>
  <main>
    <header >
      <div class="header page">
        <span>Household HQ</span>
        <span class="version">{{ VERSION }}</span>
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
  background-color: rgba(0, 0, 0, 0.452);
  color: var(--text-200);
  box-shadow: 0px 0px 10px #1f1d1d;
}

.header {
  font-size: x-small;
  padding: .3rem .5rem;
  display: flex;
  align-items: center;
}

footer {
  width: 100%;
  margin-top: auto;
  background-color: rgba(0, 0, 0, 0.452);
  color: var(--text-200);
  font-style: italic;
  font-size: x-small;
  padding: 2rem .5rem;
  display: flex;
  align-items: center;
  box-shadow: 0px 0px 10px #1f1d1d;
}

.version {
  font-style: italic;
  margin-left: auto;
  filter: brightness(0.5);
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
  display: grid;
}
</style>