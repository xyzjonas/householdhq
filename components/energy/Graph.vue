<template>
  <div class="bg-transparent card relative">
    <div class="absolute z-5 card right-0 top-0 flex gap-2">
      <ui-toggle
        v-model="showIncrements"
        :label="$t('energy_show_increments')"
        size="small"
      />
    </div>
    <Line :data="chartData" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { Line } from "vue-chartjs";
import type { ChartData, ChartOptions } from "chart.js";
import type { MeterState } from "~/types";

const props = defineProps<{ states: MeterState[]; color?: string }>();

const showIncrements = useLocalStorage("showIncrements", true);

const i18n = useI18n();
const locale = computed(() => i18n.locale.value);

const dataSet = computed<{ label: string; value: number }[]>(() => {
  if (showIncrements.value) {
    return props.states
      .map((state, index) => {
        if (index === props.states.length - 1) {
          return { label: `${new Date(state.meteredAt).getTime()}`, value: 0 };
        }
        const previous = props.states[index + 1];
        if (!previous) {
          return { label: `${new Date(state.meteredAt).getTime()}`, value: 0 };
        }
        return {
          label: new Date(state.meteredAt).toLocaleDateString(locale.value, {
            month: "2-digit",
            year: "2-digit",
          }),
          value: state.value - previous.value,
        };
      })
      .filter((it) => it.value > 0)
      .reverse();
  } else {
    return props.states
      .map((state) => ({
        label: new Date(state.meteredAt).toLocaleDateString(locale.value, {
          month: "2-digit",
          year: "2-digit",
        }),
        value: state.value,
      }))
      .reverse();
  }
});

const chartData = computed<ChartData<"line">>(() => {
  if (showIncrements.value) {
    return {
      labels: dataSet.value.map((item) => item.label),
      datasets: [
        {
          borderColor: props.color ?? "#38c089",
          backgroundColor: `${props.color ?? "#38c089"}99`,
          data: dataSet.value.map((item) => item.value),
          cubicInterpolationMode: "monotone",
          tension: 0.4,
          pointStyle: false,
        },
      ],
    };
  }
  return {
    labels: dataSet.value.map((item) => item.label),
    datasets: [
      {
        borderColor: props.color,
        backgroundColor: `${props.color}99`,
        data: dataSet.value.map((item) => item.value),
        cubicInterpolationMode: "monotone",
        tension: 0.4,
        pointStyle: false,
      },
    ],
  };
});

const { isDark } = useTheme();

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: { display: false },
  },
  scales: {
    y: {
      display: true,
      grid: {
        color: isDark.value ? "#666" : "#aaa",
      },
      title: {
        display: false,
      },
      ticks: {
        display: true,
      },
    },
    x: {
      display: true,
      ticks: {
        display: true,
      },
      grid: {
        color: isDark.value ? "#66666655" : "#cccccc55",
      },
    },
  },
};
</script>
