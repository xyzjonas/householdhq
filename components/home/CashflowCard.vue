<template>
  <section class="card">
    <header
      class="uppercase dark:text-gray-4 light:text-gray-6 justify-between flex line-height-snug"
    >
      <div class="flex flex-col">
        <h2 class="font-normal text-base">
          {{ selectedCategory ? categoryName : $t("home_month_summary") }}
        </h2>
        <span class="text-xs">{{ selectedCategory?.description }}</span>
      </div>
      <div v-if="selectedCategory" class="flex gap-2">
        <ui-button
          v-if="selectedCategory.id !== 0"
          height="36px"
          icon="i-ic-baseline-mode-edit"
          flat
          @click="navigateTo(`/categories/${selectedCategory.id}`)"
        >
          {{ $t("edit") }}
        </ui-button>
        <ui-button
          width="36px"
          height="36px"
          icon="i-ic-baseline-close"
          flat
          :aria-label="$t('close')"
          @click="categoryId = -1"
        />
      </div>
    </header>

    <ui-empty v-if="!summary" title="" :loading="status === 'pending'" />
    <div v-else class="p-5 flex gap-15 flex-wrap justify-center">
      <ui-empty
        v-if="categories.length === 0"
        icon="i-ic-baseline-bar-chart"
        :title="$t('no_data')"
        :subtitle="$t('no_data_will_appear')"
        class="flex-1 min-w-[280px] my-auto"
      />
      <home-category-chart
        v-else
        v-model:selected-id="categoryId"
        :items="categories"
        class="flex-1 min-w-[280px]"
      >
        <div class="text-center uppercase flex flex-col items-center">
          <span class="text-gray-5 text-sm">{{
            $t(kind === "income" ? "incomes" : "expenses")
          }}</span>
          <ui-price
            :amount="selectedCategory?.sum ?? kindTotal"
            size="1.6rem"
          />
        </div>
      </home-category-chart>

      <ul class="flex flex-col flex-1 justify-center gap-5 m-0 p-0 list-none">
        <li v-for="row in rows" :key="row.kind">
          <button
            type="button"
            class="row-button row-hover"
            @click="selectKind(row.kind)"
          >
            <span class="flex items-center gap-3 capitalize">
              <i v-if="kind === row.kind" class="i-ic-chevron-right"></i>
              {{ $t(row.label) }}
            </span>
            <ui-price :amount="row.amount" size="1.1rem" />
          </button>
        </li>
        <li><hr class="my-0" /></li>
        <li class="flex justify-between p-2 capitalize gap-5">
          <span>{{ $t("net") }}</span>
          <ui-price
            :amount="summary.net"
            :color="
              summary.net < 0 ? 'var(--color-danger)' : 'var(--color-success)'
            "
            size="1.1rem"
          />
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
type Kind = "income" | "expense";

/** category selected in the chart, `-1` for none */
const categoryId = defineModel<number>("categoryId", { default: -1 });
/** the side of the cashflow whose breakdown is displayed */
const kind = defineModel<Kind>("kind", { default: "expense" });

const { t } = useI18n();
const { data: summary, status } = useHomeSummary();

const categories = computed(() => {
  if (!summary.value) {
    return [];
  }
  return kind.value === "income"
    ? summary.value.incomeCategories
    : summary.value.expenseCategories;
});

const kindTotal = computed(() =>
  kind.value === "income"
    ? (summary.value?.income ?? 0)
    : (summary.value?.expense ?? 0),
);

const selectedCategory = computed(() =>
  categories.value.find((category) => category.id === categoryId.value),
);

const categoryName = computed(() =>
  selectedCategory.value?.id === 0
    ? t("home_uncategorized")
    : selectedCategory.value?.name,
);

const rows = computed(() => [
  {
    kind: "income" as const,
    label: "incomes",
    amount: summary.value?.income ?? 0,
  },
  {
    kind: "expense" as const,
    label: "expenses",
    amount: summary.value?.expense ?? 0,
  },
]);

const selectKind = (next: Kind) => {
  kind.value = next;
  categoryId.value = -1;
};

// a selection made in another period or breakdown must not linger
watch(categories, (items) => {
  if (!items.some((category) => category.id === categoryId.value)) {
    categoryId.value = -1;
  }
});
</script>

<style scoped>
.row-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
</style>
