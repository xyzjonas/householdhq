<template>
  <div class="bg-transparent card">
    <Line :data="chartData" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { Line } from "vue-chartjs";
import type { SourceState } from "~/types";

const props = defineProps<{ states: SourceState[]; color?: string }>();

const labels = computed(() => {
  const result = [];
  let lastYear = undefined;
  for (let index = 0; index < props.states.length; index++) {
    const element = props.states[index];
    if (element) {
      const year = `${new Date(element.created).getFullYear()}`;
      console.info(year);
      if (year === lastYear) {
        result.push("");
      } else {
        result.push(year);
        lastYear = year;
      }
    }
  }
  return result;
});

const chartData = computed<any>(() => {
  return {
    labels: labels.value,
    datasets: [
      {
        labels: {
          value: {
            color: "green",
          },
        },
        borderColor: props.color,
        backgroundColor: `${props.color}99`,
        data: props.states.map((state) => state.amount),
        cubicInterpolationMode: "monotone",
        tension: 0.4,
        pointStyle: false,
        borderRadius: 0,
      },
    ],
  };
});

const options = {
  type: "bar",
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: false,
  },
  scales: {
    y: {
      display: true,
      grid: {
        color: "#66666640",
        drawBorder: false,
      },
      title: {
        display: false,
      },
      ticks: {
        callback: (value: number, index: number, ticks: number) =>
          `${value / 1000}${value / 1000 > 1 ? "k" : ""}`,
      },
    },
    x: {
      display: true,
      ticks: {
        display: true,
      },
      grid: {
        color: "#66666655",
        drawBorder: false,
      },
    },
  },
} as any;
</script>
