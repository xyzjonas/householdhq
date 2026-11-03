<template>
  <div
    v-if="loaded"
    class="text-center flex flex-col items-center justify-center gap-5"
  >
    <!-- <h1 class="text-left font-light text-xl uppercase">{{ category.name }}</h1> -->
    <div class="h-60 w-full">
      <Bar :data="chartData" :options="options" />
    </div>
    <div class="toggle-bar m-1">
      <a
        :class="`bar-item ${dataSelection === 6 ? 'active' : ''}`"
        @click="dataSelection = 6"
        >{{ t("summary_recent") }}</a
      >
      <a
        :class="`bar-item ${dataSelection === 12 ? 'active' : ''}`"
        @click="dataSelection = 12"
        >{{ t("summary_year") }}</a
      >
      <a
        :class="`bar-item ${dataSelection === 0 ? 'active' : ''}`"
        @click="dataSelection = 0"
        >{{ t("summary_all") }}</a
      >
    </div>
  </div>
  <spinner v-else name="roller" class="center h-full" />
</template>
<script lang="ts" setup>
import { Bar } from "vue-chartjs";
import { useCategoriesStore } from "../stores/categories";
import { storeToRefs } from "pinia";
import type { CategoryWithSum } from "../types";
import { getRelativePosition } from "chart.js/helpers";
import type { ChartData, ChartOptions } from "chart.js";
import { useLocalStorage } from "@vueuse/core";

const { t } = useI18n();

const categoriesStore = useCategoriesStore();
const { summary } = storeToRefs(categoriesStore);

defineOptions({ name: "CategorySummary" });

const props = defineProps<{
  category: Pick<CategoryWithSum, "id" | "name" | "color">;
}>();

const dataSelection = useLocalStorage(
  `category-${props.category.id}-summary-data-range`,
  12,
);

const loaded = ref(false);
onMounted(() => {
  categoriesStore
    .fetchSummary(props.category.id)
    .finally(() => setTimeout(() => (loaded.value = true), 200));
});

const data = computed(() => {
  if (dataSelection.value === 0) {
    return summary.value;
  }

  return summary.value.slice(-1 * dataSelection.value);
});

const labels = computed(() => {
  if (dataSelection.value === 0) {
    return summary.value.map(() => "");
  }

  return summary.value
    .slice(-1 * dataSelection.value)
    .map((s) => formatMMYYYY(new Date(s.year, s.month)));
});

const i18n = useI18n();
const formatMMYYYY = (date: Date) => {
  const month = date
    .toLocaleDateString(i18n.locale.value, { month: "long" })
    .toUpperCase()
    .substring(0, 3);
  if (new Date().getFullYear() !== date.getFullYear()) {
    const year = `${date.getFullYear()}`.substring(2);
    return `${month}/${year}`;
  }

  return month;
};

const chartData = computed<ChartData<"bar">>(() => {
  return {
    labels: labels.value,
    datasets: [
      {
        label: props.category.name,
        borderColor: props.category.color ?? undefined,
        backgroundColor: `${props.category.color}99`,
        data: data.value.map((s) => s.amount),
        borderRadius: 4,
      },
    ],
  };
});

const callback: ChartOptions<"bar">["onClick"] = (e, _elements, chart) => {
  // OnClick emit filter by category
  console.info(chart);
  const canvasPosition = getRelativePosition(e, chart);

  // Substitute the appropriate scale IDs
  const dataX = chart.scales.x?.getValueForPixel(canvasPosition.x);
  if (dataX === undefined) {
    return;
  }

  const item = summary.value.slice(-1 * dataSelection.value)[dataX];
  if (item) {
    console.info(item.year, item.month);
    navigateTo(`/?year=${item.year}&month=${item.month + 1}`);
  }
};

const options: ChartOptions<"bar"> = {
  responsive: true,
  onClick: callback,
  maintainAspectRatio: false,
  plugins: {
    datalabels: { display: false },
  },
  scales: {
    y: {
      display: true,
      title: {
        display: false,
      },
      ticks: {
        callback: (value) =>
          `${Number(value) / 1000}${Number(value) / 1000 > 1 ? "k" : ""}`,
      },
    },
    x: {
      display: true,
    },
  },
};
</script>
<style lang="scss" scoped>
.bar-item {
  width: 6rem;
}
</style>
