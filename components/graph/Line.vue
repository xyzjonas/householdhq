<template lang="">
    <div id="chart"></div>
</template>
<script lang="ts" setup>
import ApexCharts from 'apexcharts'

const props = defineProps<{
    data: any[],
    categoryName: string,
}>()

const emit = defineEmits(["clicked"])

const axisColor = "#aaa";
const options = {
    series: [
        {
            name: "High - 2013",
            data: props.data
        },
    ],
    chart: {
        type: 'line',
        height: 320,
        dropShadow: {
            enabled: true,
            color: '#000',
            top: 18,
            left: 7,
            blur: 10,
            opacity: 0.2
        },
        toolbar: {
            show: false
        }
    },
    dataLabels: {
        enabled: true,
    },
    stroke: {
        curve: 'smooth'
    },
    title: {
        text: `${props.categoryName} - last 12 months`,
        align: 'left',
        margin: 0,
        offsetX: 10,
        style: {
            color: axisColor,
        }
    },
    grid: {
        borderColor: '#222',
        position: "back",
        row: {
            colors: ['#f3f3f322', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
        },
        yaxis: {
            lines: {
                show: true,
            }
        }
    },
    markers: {
        size: 1
    },
    xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        labels: {
            style: {
                colors: props.data.map(() => axisColor),
            },
        },
        axisBorder: {
            color: axisColor
        }
    },
    yaxis: {
        axisBorder: {
            show: true,
            color: axisColor
        },
        labels: {
            show: false,
        }
    },
    legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5
    },
    tooltip: {
        enabled: false
    }
};

onMounted(() => {
    const chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
})
</script>

<style lang="scss" scoped>
#chart {
    width: 95%;
    margin-inline: auto;
    // margin: 1rem;
    height: 320px;
    
}
</style>