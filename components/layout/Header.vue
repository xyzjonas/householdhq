<template>
  <div
    class="flex justify-center md:justify-between items-center w-full flex-1 max-w-7xl mx-auto"
  >
    <transition name="page" mode="out-in">
      <span
        v-if="!drawer"
        class="hidden md:block uppercase text-gray-5 text-xs"
      >
        HouseholdHQ
      </span>
    </transition>
    <ClientOnly class="ml-auto">
      <LayoutToggles />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { transition } from "@vueuse/core";

const { drawer } = useDrawer();
</script>

<style lang="scss" scoped></style>
