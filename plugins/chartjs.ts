import { Chart, Title, Tooltip, BarElement, CategoryScale, LinearScale, ArcElement, LineElement, PointElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels';

export default defineNuxtPlugin(() => {
    Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, ArcElement, PointElement, LineElement, ChartDataLabels)
})