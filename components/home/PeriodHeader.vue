<template>
  <header class="flex flex-col flex-1 items-center md:items-start">
    <template v-if="period">
      <h1 class="font-bold line-height-[1.5] text-nowrap">
        {{ $t("home_overview", { month: monthName }) }}
      </h1>
      <p class="text-sm dark:text-gray-3 light:text-gray-6">
        {{ $t("home_cashflow_range", { range }) }}
      </p>
      <nav class="flex mt-3 gap-3 items-center h-8">
        <NuxtLink
          :to="{ query: { period: period.prevKey } }"
          :aria-label="$t('home_period_prev')"
          class="flex"
        >
          <i class="i-ic-baseline-arrow-back text-2xl"></i>
        </NuxtLink>
        <div class="min-w-25">
          <NuxtLink v-if="!period.isCurrent" to="/" class="flex">
            <ui-pin :text="$t('home_this_period')" clickable />
          </NuxtLink>
        </div>
        <NuxtLink
          :to="{ query: { period: period.nextKey } }"
          :aria-label="$t('home_period_next')"
          class="flex"
        >
          <i class="i-ic-baseline-arrow-forward text-2xl"></i>
        </NuxtLink>
      </nav>
    </template>
  </header>
</template>

<script setup lang="ts">
const { locale } = useI18n();
const { data: period } = useHomePeriod();

// a period is named after the month it ends in
const monthName = computed(() =>
  period.value ? getMonthName(parseDay(period.value.endDay), locale.value) : "",
);

const range = computed(() =>
  period.value
    ? formatDayRange(period.value.startDay, period.value.endDay, locale.value)
    : "",
);
</script>
