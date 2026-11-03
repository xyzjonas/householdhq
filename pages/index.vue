<template>
  <div class="flex flex-col gap-2 pb-12">
    <home-period-header />
    <hr class="mb-3" />

    <div class="flex gap-2 flex-wrap">
      <div class="flex flex-col gap-2 flex-[4] min-w-0">
        <home-balance-card v-if="period?.isCurrent" />
        <home-cashflow-card
          v-model:category-id="categoryId"
          v-model:kind="kind"
        />
      </div>
      <home-sidebar />
    </div>

    <home-add-transaction />

    <home-important-list />
    <home-upcoming-card v-if="period?.isCurrent" />
    <home-transactions-list :filters="filters" />
  </div>
</template>

<script setup lang="ts">
const { data: period } = useHomePeriod();

const categoryId = ref(-1);
const kind = ref<"income" | "expense">("expense");

// the listing narrows down to what the cashflow card has selected
const filters = computed(() => ({
  categoryId: categoryId.value >= 0 ? categoryId.value : undefined,
  kind: kind.value === "income" ? ("income" as const) : undefined,
}));
</script>
