
import type { mergeProps } from 'nuxt/dist/app/compat/capi';
<template lang="">
    <div id="chart"></div>
</template>
<script lang="ts" setup>
import ApexCharts from 'apexcharts'

const props = defineProps<{
  title?: string,
  data: any[],
  labels: any[],
  colors: string[],
}>()

const emit = defineEmits(["clicked"])

const options = {
  chart: {
    type: 'bar',
    height: '100%',
    width: '100%',
    events: {
      dataPointSelection: (event: any, chartContext: any, config: any) => emit('clicked', config)
    },
    toolbar: {
        show: false,
    }
  },
  colors: props.colors,
  plotOptions: {
    bar: {
      borderRadius: 2,
      horizontal: true,
      // columnWidth: '200%',
      dataLabels: {
        position: 'bottom',
      },
    },
  },
  dataLabels: {
    enabled: true,
    textAnchor: "left",
    offsetX: 10,
    offsetY: 10,
    // todo: real locale!
    formatter: (val: number, opt: { seriesIndex: number; dataPointIndex: number; w: Object }) =>  {
      return val.toLocaleString('cs', {
        style: 'currency',
        currency: 'CZK',
      });
    },
    style: {
      fontSize: '1.2rem',
      colors: ["white"],
    },
    background: {
      enabled: true,
      foreColor: '#242635',
      opacity: 0.3,
    },
    // dropShadow: {
    //   enabled: true
    // }
  },
  series: props.data.map(d => ({data: [d]})),
  grid: {
    show: false,
    xaxis: {
      lines: {
        show: false,
      }
    },
    yaxis: {
      reversed: true,
      lines: {
        show: false,
      }
    }
  },
  xaxis: {
    labels: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    }
  },
  yaxis: {
    labels: {
      show: false,
    },
  },
  tooltip: {
    enabled: false,
  },
  legend: {
    show: false,
  }
}

onMounted(() => {
  const chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
})
</script>

<style lang="scss" scoped>
#chart {
  width: 100%;
  // height: 60%;
  // margin: 1rem;
  overflow: none;
}
</style>