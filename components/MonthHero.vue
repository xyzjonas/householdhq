<template>
  <div class="flex flex-col flex-1 items-center md:items-start">
    <div class="flex justify-center md:justify-between items-center w-full">
      <span class="hidden md:inline uppercase text-gray-5 text-xs">
        HouseholdHQ
      </span>
      <ClientOnly>
        <LayoutToggles />
      </ClientOnly>
    </div>
    <h1 class="font-bold line-height-[1.5] text-nowrap">
      {{ monthName }} Overview
    </h1>
    <p class="text-sm dark:text-gray-3 light:text-gray-6">
      Household cashfow 1-30 {{ monthName }} {{ year }}
    </p>
    <div class="flex mt-3 gap-3 items-center h-8">
      <div class="flex gap-3 items-center">
        <NuxtLink
          :to="`/?year=${previous.getFullYear()}&month=${
            previous.getMonth() + 1
          }`"
          @click="$emit('reload', previous)"
          class="left flex"
        >
          <i class="i-ic-baseline-arrow-back text-2xl"></i>
        </NuxtLink>
      </div>
      <div class="min-w-25">
        <NuxtLink
          v-if="!isCurrent"
          to="/"
          @click="$emit('reload', new Date())"
          class="left flex"
        >
          <ui-pin text="This month" clickable></ui-pin>
        </NuxtLink>
      </div>
      <NuxtLink
        :to="`/?year=${next.getFullYear()}&month=${next.getMonth() + 1}`"
        @click="$emit('reload', next)"
        class="right flex"
      >
        <i class="i-ic-baseline-arrow-forward text-2xl"></i>
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useCurrentMonth } from "~/composables/useCurrentMonth";

const { monthName, year, next, previous, isCurrent, dateFormatted } =
  useCurrentMonth();

defineEmits(["reload"]);
</script>
