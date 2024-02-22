import { Chart, Title, Tooltip, BarElement, CategoryScale, LinearScale, ArcElement, LineElement, PointElement } from 'chart.js'

export default defineNuxtPlugin(() => {
    Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, ArcElement, PointElement, LineElement)
})