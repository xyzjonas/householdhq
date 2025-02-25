<template>
  <div class="relative flex flex-col h-md">
    <ui-empty
      v-if="!areThereTransactions || loading"
      :loading="loading"
      icon="i-ic-baseline-bar-chart"
      :title="$t('no_data')"
      :subtitle="$t('no_data_will_appear')"
      class="my-auto"
    />
    <section v-else-if="selectedCategory" class="h-full">
      <Summary
        :category="selectedCategory"
        @edit="navigateTo(`/tags/${selectedCategory.id}`)"
        @close="selectedCategoryName = ''"
      />
      <div id="actions" class="row center">
        <ui-button
          width="48px"
          height="36px"
          icon="i-ic-baseline-mode-edit"
          @click="navigateTo(`/categories/${selectedCategory.id}`)"
        />
        <ui-button
          width="48px"
          height="36px"
          icon="i-ic-baseline-close"
          @click="selectedCategoryName = ''"
        />
      </div>
    </section>
    <section
      v-else-if="showLegend"
      class="h-full flex flex-col justify-start p-"
    >
      <div
        v-for="item in items.filter(it => it.sum > 0)"
        class="legend-content-item relative overflow-hidden"
        @click="selectCategoryByName(item.name)"
      >
        <span
          class="circle-sm mr-1"
          :style="`background-color: ${item.color};`"
        ></span>
        <span class="absolute inset-0 opacity-[0.1] left-[2]" :style="`background-color: ${item.color}; right: ${100 - percentage(item.sum)}%`"></span>
        <span class="mr-1">{{ item.name }}</span>
        <ui-price :amount="item.sum" size="small" class="ml-auto mr-2" />
      </div>
    </section>
    <div v-else class="graph-wrapper">
      <Doughnut :data="data" :options="options" />
      <div class="graph-wrapper-center">
        <slot></slot>
      </div>
    </div>

    <client-only v-if="!selectedCategory">
      <div id="show-legend" class="flex gap-1">
        <ui-button
          @click="navigateTo('/categories')"
          icon="i-ic-baseline-category"
          icon-size="1.3rem"
          class="mt-auto"
        />
        <ui-button
          :icon="
            showLegend
              ? 'i-ic-baseline-pie-chart'
              : 'i-ic-round-format-list-bulleted'
          "
          icon-size="1.3rem"
          @click="showLegend = !showLegend"
        />
      </div>
    </client-only>
  </div>
</template>
<script setup lang="ts">
import { Doughnut } from "vue-chartjs";
import { storeToRefs } from "pinia";
import type { CategoryWithSum } from "@/types";

import { useTransactionStore } from "@/stores/transactions";
import { useLocalStorage } from "@vueuse/core";

const showLegend = useLocalStorage<boolean>('display-list-view', false);

const props = defineProps<{
  items: CategoryWithSum[];
  expand?: boolean;
}>();

const selectedCategoryName = ref<string>("");
const selectedCategory = computed(() => {
  return props.items.find(
    (it) => it.name && it.name === selectedCategoryName.value
  );
});

const sum = computed(() => props.items.reduce((a, b) => a + b.sum, 0))
const percentage = (value: number) => round(value / sum.value * 100, 0)

const { loading } = storeToRefs(useTransactionStore());

const emit = defineEmits(["filter"]);
watch(selectedCategory, (value, _) => {
  emit("filter", value?.id ?? -1);
});

const showedItems = computed(() => {
  if (selectedCategoryName.value) {
    return props.items.filter((it) => it.name === selectedCategoryName.value);
  }
  return props.items;
});

const areThereTransactions = computed(() => {
  return showedItems.value.map((cat) => cat.transactions).flat().length > 0;
});

const borderColor = (item: CategoryWithSum) => {
  if (item.name === selectedCategoryName.value) {
    return "white";
  }
  return item.color ?? "var(--bg-300)";
};

const data = computed(() => {
  return {
    labels: showedItems.value.map((it) => it.name),
    datasets: [
      {
        data: showedItems.value.map((it) => it.sum),
        backgroundColor: showedItems.value.map((it) => it.color ?? "white"),
        borderColor: showedItems.value.map(borderColor),
      },
    ],
    borderColor: "red",
    defaults: {
      borderColor: "red",
    },
  };
});

const selectCategoryByName = (name: string) => {
  if (selectedCategoryName.value === name) {
    selectedCategoryName.value = "";
  } else {
    selectedCategoryName.value = name;
  }
};

const callback = (e: any) => {
  // OnClick emit filter by category
  const label = e.chart.tooltip.title[0];
  selectCategoryByName(label);
};

const options = {
  responsive: true,
  onClick: callback,
  cutout: () => (props.expand ? "90%" : "90%"),
  offset: 0,
  spacing: 7,
  plugins: {
    datalabels: {
      display: () => false,
      // color: shouldInvert(props.category.color) ? '#333' : '#ddd',
      backgroundColor: "black",
      textShadowColor: (val: any) => props.items[val.dataIndex].color,
      textShadowBlur: 10,
      color: "white",
      borderRadius: 5,
      anchor: "center",
      formatter: (val: number) => (val < 5000 ? null : val),
      labels: {
        title: {
          font: {},
        },
      },
    },
  },
} as any;
</script>
<style lang="scss" scoped>
section {
  width: 100%;
}

.legend {
  margin-top: 12px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &-content {
    display: flex;
    gap: 1.2rem;
    flex-wrap: wrap;
    justify-content: center;

    &-item {
      display: flex;
      align-items: center;
      gap: 0.2rem;
      font-size: small;
      border: 1px solid var(--border-100);
      background-color: var(--bg-200);
      padding: 2px 5px;
      border-radius: 2rem;
      cursor: pointer;
      transition: filter 0.1s ease-in-out;

      &:hover {
        font-weight: 500;
      }
    }
  }
}

.graph-card {
  position: relative;
  height: 100%;
  height: 320px;
}

@media (min-width: 992px) {
  .graph-card {
    height: 560px;
  }
}

#show-legend {
  position: absolute;
  bottom: 4px;
  right: 4px;
}

#actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 0.3rem;
}

.graph-wrapper {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-items: center;

  &-center {
    position: absolute;
  }
}

.progress-background {
  inset: 0;
}
</style>
