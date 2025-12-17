<template>
  <div class="sidenav" :style="model ? 'width: 240px' : ''">
    <div class="pseudo-header flex">
      <div class="flex-col p-2">
        <span class="line-height-none">Household HQ</span>
        <span class="text-xs opacity-[0.8]">{{ VERSION }}</span>
      </div>
    </div>
    <div class="drawer-body p-3 border-r-solid border-1 flex-col gap-2 flex-1">
      <span class="text-gray-5 text-sm mb-2">Pages</span>
      <ui-list-row
        @click="navigateTo('/')"
        :class="{ active: $route.path === '/' }"
      >
        <span class="flex justify-between items-center">
          <span class="flex items-center gap-2">
            <i class="i-ic-baseline-space-dashboard"></i>
            <h3>Dashboard</h3>
          </span>
          <span class="text-xs">{{ currentMonth.length }}</span>
        </span>
      </ui-list-row>

      <ui-list-row
        @click="navigateTo('/sources')"
        :class="{ active: $route.path === '/sources' }"
      >
        <span class="flex justify-between items-center">
          <span class="flex items-center gap-2">
            <i class="i-ic-baseline-account-balance"></i>
            <h3>{{ $t("route_sources") }}</h3>
          </span>
          <span class="text-xs">{{ sources.length }}</span>
        </span>
      </ui-list-row>

      <ui-list-row
        @click="navigateTo('/categories')"
        :class="{ active: $route.path === '/categories' }"
      >
        <span class="flex justify-between items-center">
          <span class="flex items-center gap-2">
            <i class="i-ic-baseline-category"></i>
            <h3>{{ $t("route_categories") }}</h3>
          </span>
          <span class="text-xs">{{ categories.length }}</span>
        </span>
      </ui-list-row>

      <ui-list-row
        @click="navigateTo('/projects')"
        :class="{ active: $route.path === '/projects' }"
      >
        <span class="flex justify-between items-center">
          <span class="flex items-center gap-2">
            <i class="i-ic-baseline-folder"></i>
            <h3>{{ $t("route_projects") }}</h3>
          </span>
          <span class="text-xs">{{ allProjects.length }}</span>
        </span>
      </ui-list-row>

      <ui-list-row
        @click="navigateTo('/transactions')"
        :class="{ active: $route.path === '/transactions' }"
      >
        <span class="flex justify-between items-center">
          <span class="flex items-center gap-2">
            <i class="i-ic-outline-manage-search"></i>
            <h3>{{ $t("t_transactions") }}</h3>
          </span>
        </span>
      </ui-list-row>

      <ui-list-row @click="navigateTo('/important')">
        <span class="flex items-center gap-2">
          <i class="i-ic-round-warning"></i>
          <h3>{{ $t("route_important") }}</h3>
        </span></ui-list-row
      >
      <ui-list-row @click="navigateTo('/energy')">
        <span class="flex items-center gap-2">
          <i class="i-ic-baseline-electric-bolt"></i>
          <h3>{{ $t("route_energy") }}</h3>
        </span></ui-list-row
      >

      <ui-list-row class="mt-auto" @click="session.logout()">
        <span class="flex items-center gap-2">
          <i class="i-ic-baseline-logout"></i>
          <h3>Log Out</h3>
        </span></ui-list-row
      >
      <hr />
      <client-only class="my-2">
        <span v-if="loggedUser" class="flex items-center gap-2">
          <i class="i-ic-baseline-person text-lg"></i>
          <h3 class="capitalize">{{ loggedUser }}</h3>
          <ui-pin text="administrator" size="small" class="ml-auto" />
        </span>
        <span v-else> Logged Out </span>
        <template #placeholder>
          <spinner class="mx-auto"></spinner>
        </template>
      </client-only>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VERSION } from "~/_version";

const model = defineModel<boolean>();
// const props = defineProps<{
//   overlay?: boolean;
// }>();

const session = useTokenStore();
const { loggedUser } = storeToRefs(session);

const catStore = useCategoriesStore();
const { categories } = storeToRefs(catStore);

const accStore = useSourcesStore();
const { sources } = storeToRefs(accStore);

const projStore = useProjectsStore();
const { allProjects } = storeToRefs(projStore);

const transStore = useTransactionStore();
const { currentMonth } = storeToRefs(transStore);
</script>

<style lang="scss" scoped>
@use "@/assets/css/base.scss";

h3 {
  text-transform: capitalize;
}

.active {
  color: var(--primary-100);
}

.sidenav {
  width: 0; /* 0 width - change this with JavaScript */
  background-color: var(--bg-100); /* Black*/
  overflow-x: hidden; /* Disable horizontal scroll */
  transition: 0.1s ease-in-out; /* 0.5 second transition effect to slide in the sidenav */
  overflow: hidden;

  background-color: var(--bg-100); /* Black*/
  overflow-x: hidden; /* Disable horizontal scroll */
  transition: 0.1s ease-in-out; /* 0.5 second transition effect to slide in the sidenav */
  overflow: hidden;
  align-self: stretch;

  @media only screen and (max-width: base.$bp-medium) {
    width: 0; /* 0 width - change this with JavaScript */
    position: fixed; /* Stay in place */
    z-index: 2; /* Stay on top */
    top: 0; /* Stay at the top */
    left: 0;
    bottom: 0;
    background-color: var(--bg-100); /* Black*/
    overflow-x: hidden; /* Disable horizontal scroll */
    overflow: hidden;
  }

  display: flex;
  flex-direction: column;
  text-wrap: nowrap;
}

.pseudo-header {
  height: 57px;
  background-color: var(--primary-100);

  display: none;
  @media only screen and (max-width: base.$bp-medium) {
    display: block;
  }
}

.drawer-body {
  border-color: var(--border-100);
}
</style>
