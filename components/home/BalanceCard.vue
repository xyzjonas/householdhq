<template>
  <section class="card flex flex-col gap-4">
    <ui-empty v-if="!balance" title="" :loading="status === 'pending'" />
    <template v-else>
      <div
        class="text-center font-thin uppercase flex flex-col justify-center items-center"
      >
        <h2 class="text-gray-5 font-thin">{{ $t("balance") }}</h2>
        <ui-price :amount="balance.balance" size="2.5rem" />
      </div>
      <hr class="my-0 w-full" />
      <ul class="flex flex-col gap-3 m-0 p-0 list-none">
        <li
          v-for="projection in projections"
          :key="projection.label"
          class="flex items-center justify-between gap-5"
        >
          <div class="flex flex-col">
            <span class="text-sm text-gray-5">{{ projection.label }}</span>
            <span class="text-xs text-gray-5">
              {{ $t("home_pending_count", { count: projection.pendingCount }) }}
            </span>
          </div>
          <ui-price
            :amount="projection.projected"
            size="1.3rem"
            :color="
              projection.projected < 0 ? 'var(--color-danger)' : undefined
            "
          />
        </li>
      </ul>
    </template>
  </section>
</template>

<script setup lang="ts">
const { t, locale } = useI18n();
const { data: balance, status } = useHomeBalance();

const projections = computed(() => {
  if (!balance.value) {
    return [];
  }

  const { calendarMonthEnd, fiscalPeriodEnd } = balance.value;
  const describe = (
    key: "home_until_month_end" | "home_until_period_end",
    projection: typeof calendarMonthEnd,
  ) => ({
    ...projection,
    label: t(key, { date: formatDayShort(projection.date, locale.value) }),
  });

  const month = describe("home_until_month_end", calendarMonthEnd);
  // with the period ending together with the month there's only one projection
  if (calendarMonthEnd.date === fiscalPeriodEnd.date) {
    return [month];
  }
  return [month, describe("home_until_period_end", fiscalPeriodEnd)];
});
</script>
