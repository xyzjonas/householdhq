<template>
  <div class="flex flex-col gap-3">
    <div class="relative h-64">
      <ClientOnly>
        <Doughnut :data="chartData" :options="options" />
        <template #fallback>
          <div class="ring-placeholder" />
        </template>
      </ClientOnly>
      <div
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <slot />
      </div>
    </div>
    <ul class="flex flex-wrap justify-center gap-2 p-0 m-0 list-none">
      <li v-for="item in items" :key="item.id">
        <button
          type="button"
          class="legend-item"
          :class="{ selected: item.id === selectedId }"
          :disabled="item.id === 0"
          @click="toggle(item.id)"
        >
          <span class="dot" :style="{ backgroundColor: colorOf(item) }"></span>
          {{ nameOf(item) }}
          <span class="text-gray-5">{{ percentage(item.sum) }}%</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Doughnut } from "vue-chartjs";
import type { ChartData, ChartOptions } from "chart.js";
import type { HomeCategorySum } from "~/types/home";

const FALLBACK_COLOR = "#a1a1aa";

const props = defineProps<{ items: HomeCategorySum[] }>();

const selectedId = defineModel<number>("selectedId", { default: -1 });

const { t } = useI18n();

const total = computed(() =>
  props.items.reduce((sum, item) => sum + item.sum, 0),
);
const percentage = (value: number) =>
  total.value > 0 ? Math.round((value / total.value) * 100) : 0;

const nameOf = (item: HomeCategorySum) =>
  item.id === 0 ? t("home_uncategorized") : item.name;
const colorOf = (item: HomeCategorySum) => item.color ?? FALLBACK_COLOR;

const toggle = (id: number) => {
  selectedId.value = selectedId.value === id ? -1 : id;
};

const chartData = computed<ChartData<"doughnut">>(() => ({
  labels: props.items.map(nameOf),
  datasets: [
    {
      data: props.items.map((item) => item.sum),
      backgroundColor: props.items.map(colorOf),
      borderColor: props.items.map((item) =>
        item.id === selectedId.value ? "white" : colorOf(item),
      ),
    },
  ],
}));

const options: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  radius: "96%",
  cutout: "80%",
  spacing: 7,
  plugins: { datalabels: { display: false } },
  onClick: (_event, elements) => {
    const index = elements[0]?.index;
    const item = index === undefined ? undefined : props.items[index];
    if (item && item.id !== 0) {
      toggle(item.id);
    }
  },
};
</script>

<style scoped>
.ring-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1.5rem solid var(--bg-300);
  box-sizing: border-box;
  opacity: 0.5;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: small;
  color: inherit;
  border: 1px solid var(--border-100);
  background-color: var(--bg-200);
  padding: 2px 8px;
  border-radius: 2rem;
  cursor: pointer;
  transition: filter 0.1s ease-in-out;
}

.legend-item:hover:not(:disabled),
.legend-item.selected {
  font-weight: 500;
  border-color: var(--text-100);
}

.legend-item:disabled {
  cursor: default;
}

.dot {
  width: 0.6rem;
  aspect-ratio: 1;
  border-radius: 50%;
}
</style>
