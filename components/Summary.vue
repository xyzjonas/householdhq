<template>
  <div class="summary" v-if="loaded">
    <div class="row-simple center mb-1">
      <h1>{{ category.name }}</h1>
    </div>
    <Line :data="chartData" :options="options"/>
  </div>
  <spinner name="roller" class="center" v-else />
</template>
<script lang="ts" setup>
import { Line } from 'vue-chartjs'
import { useCategoriesStore } from "../stores/categories";
import { storeToRefs } from "pinia";
import type { TagWithSum } from "../stores/types";
import { shouldInvert } from '~/utils/color';

const categoriesStore = useCategoriesStore();
const { summaryId, summary, summaryLoading } = storeToRefs(categoriesStore);

const props = defineProps<{
  category: TagWithSum;
}>();

const loaded = ref(false);
onMounted(() => {
  categoriesStore.fetchSummary(props.category.id).finally(() => loaded.value = true);
});

const i18n = useI18n();
const formatMMYYYY = (date: Date) => {
  return date.toLocaleDateString(i18n.locale.value, { month: "long" }).toUpperCase().substring(0,3);
};

const chartData = computed<any>(() => {
    return {
        labels: summary.value.map(s => formatMMYYYY(new Date(s.year, s.month))),
        datasets: [
            {
                label: props.category.name,
                borderColor: props.category.color,
                // borderWidth: 2,
                // borderRadius: 5,
                // backgroundColor: `${props.category.color}35`,
                data: summary.value.map(s => s.amount),
                cubicInterpolationMode: 'monotone',
                tension: 0.4,
                pointStyle: false,
            }
        ]
    }
})

const options = {
  type: 'line',
  responsive: true,
  plugins: {
    datalabels: {
      backgroundColor: props.category.color,
      color: shouldInvert(props.category.color) ? '#333' : '#ddd',
      borderRadius: 3,
      anchor: 'end',
      offset: 100,
      labels: {
        title: {
          font: {
            weight: 'bold'
          }
        },
      }
    }
  },
  scales: {
    y: {
      display: false,
      title: {
        display: false,
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
  color: v-bind('category.color');
  font-weight: 300;
}
</style>
