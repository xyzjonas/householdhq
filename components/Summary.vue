<template>
  <div class="text-center flex flex-col justify-between h-full" v-if="loaded">
    <h1 class="text-left font-light text-xl uppercase">{{ category.name }}</h1>
    <div class="h-xs">
      <Bar :data="chartData" :options="options" />
    </div>
    <div class="center">
        <div class="toggle-bar m-1">
          <a @click="dataSelection = 6" :class="`bar-item ${dataSelection === 6 ? 'active' : ''}`">{{ t('summary_recent') }}</a>
          <a @click="dataSelection = 12" :class="`bar-item ${dataSelection === 12 ? 'active' : ''}`">{{ t('summary_year') }}</a>
          <a @click="dataSelection = 0" :class="`bar-item ${dataSelection === 0 ? 'active' : ''}`">{{ t('summary_all') }}</a>
        </div>
      </div>
  </div>
  <spinner name="roller" class="center" v-else />
</template>
<script lang="ts" setup>
import { Bar } from 'vue-chartjs'
import { useCategoriesStore } from "../stores/categories";
import { storeToRefs } from "pinia";
import type { CategoryWithSum } from "../types";
import { useWindowSize } from '@vueuse/core';

const { width, height } = useWindowSize()

const { t } = useI18n()

const categoriesStore = useCategoriesStore();
const { summary } = storeToRefs(categoriesStore);

const props = defineProps<{
  category: CategoryWithSum;
}>();

const dataSelection = ref(6)
const cropDataset = ref(false)

const loaded = ref(false);
onMounted(() => {
  categoriesStore.fetchSummary(props.category.id).finally(() => loaded.value = true);
});

const data = computed(() => {
  if (dataSelection.value === 0) {
    return summary.value
  }

  return summary.value.slice(-1 * dataSelection.value)
})

const labels = computed(() => {
  if (dataSelection.value === 0) {
    return summary.value.map(() => '')
  }

  return summary.value.slice(-1 * dataSelection.value).map(s => formatMMYYYY(new Date(s.year, s.month)))
})

const i18n = useI18n();
const formatMMYYYY = (date: Date) => {
  const month = date.toLocaleDateString(i18n.locale.value, { month: "long" }).toUpperCase().substring(0,3);
  if (new Date().getFullYear() !== date.getFullYear()) {
    const year = `${date.getFullYear()}`.substring(2)
    return `${month}/${year}`
  }

  return month
};

const chartData = computed<any>(() => {
    return {
        labels: labels.value,
        datasets: [
            {
                label: props.category.name,
                borderColor: props.category.color,
                // borderWidth: 2,
                // borderRadius: 5,
                backgroundColor: `${props.category.color}99`,
                data: data.value.map(s => s.amount),
                cubicInterpolationMode: 'monotone',
                tension: 0.4,
                pointStyle: false,
                borderRadius: 5,
                barThickness: width.value < 992 ? 6 : 20,
            }
        ]
    }
})

const options = {
  type: 'bar',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: false,
    // {
    //   backgroundColor: '#e0e0e0',
    //   color: "#1a1a1a",
    //   borderRadius: 3,
    //   anchor: 'start',
    //   offset: 0,
    //   labels: {
    //     title: {
    //       font: {
    //         // weight: 'bold'
    //       }
    //     },
    //   }
    // }
  },
  scales: {
    y: {
      display: true,
      title: {
        display: false,
      },
      ticks: {
        callback: (value: number, index: number, ticks: number) => `${value / 1000}${value / 1000 > 1 ? 'k' : ''}`
      }
    },
    x: {
      display: true,
    }
  }
} as any;
</script>
<style lang="scss" scoped>
.bar-item {
  width: 6rem;
}
</style>