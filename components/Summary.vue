<template>
    <Bar :data="chartData" :options="options" :style="myStyles"/>
</template>
<script lang="ts" setup>
import { useCategoriesStore } from '@/stores/categories';
import { storeToRefs } from 'pinia';

import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { TagWithSum } from 'stores/types';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const categoriesStore = useCategoriesStore()
const { summaryId, summary, summaryLoading } = storeToRefs(categoriesStore);

const props = defineProps<{
    category: TagWithSum
}>();

onMounted(() => {
    categoriesStore.fetchSummary(props.category.id);
})


const chartData = computed(() => {
    return {
        labels: summary.value.map(s => `${s.year}-${s.month}`),
        datasets: [
            {
                label: props.category.name,
                borderColor: props.category.color,
                borderWidth: 2,
                borderRadius: 5,
                backgroundColor: `${props.category.color}35`,
                data: summary.value.map(s => s.amount),
            }
        ]
    }
})

const myStyles = computed(() => {
    return {
        width: '100%',
    }
})

const options = {
    responsive: false,
    plugins: {
        legend: {
            display: false,
            position: "right",
            fullSize: true,
        }
    }
}

</script>
<style lang="scss" scoped>
    
</style>