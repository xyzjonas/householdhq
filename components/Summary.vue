<template>
  <div class="text-center" v-if="loaded">
    <h1 class="font-light">{{ category.name }}</h1>
    <Bar :data="chartData" :options="options" :style="charStyles" />
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

const categoriesStore = useCategoriesStore();
const { summary } = storeToRefs(categoriesStore);

const props = defineProps<{
  category: CategoryWithSum;
}>();

const loaded = ref(false);
onMounted(() => {
  categoriesStore.fetchSummary(props.category.id).finally(() => loaded.value = true);
});


// values from BarGrapsh CSS
const charStyles = computed(() => ({
  width: '100%',
  height: width.value < 992 ? '220px' : '420px',
  'margin-bottom': 'auto',
}))

const BAR_THICKNESS = 10;
const data = computed(() => {
  if (width.value < 992) {
    return summary.value.slice(-8)
  }

  return summary.value
})

const labels = computed(() => {
  if (width.value < 992) {
    return summary.value.slice(-8).map(s => formatMMYYYY(new Date(s.year, s.month)))
  }

  return summary.value.map(s => formatMMYYYY(new Date(s.year, s.month)))
})

const i18n = useI18n();
const formatMMYYYY = (date: Date) => {
  return date.toLocaleDateString(i18n.locale.value, { month: "long" }).toUpperCase().substring(0,3);
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
                borderRadius: width.value < 992 ? 10 : 5,
                barThickness: width.value < 992 ? 10 : 20,
            }
        ]
    }
})

const options = {
  type: 'bar',
  responsive: false,
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
.row {
  gap: 0.33rem
}

h1 {
  text-transform: uppercase;
  position: absolute;
  top: 0.3rem;
  left: 1rem;
  z-index: 1000;
  // color: v-bind('category.color');
  // font-weight: 300;
  filter: opacity(0.7);
  // text-shadow: 2px 2px 3px black;
}
</style>
