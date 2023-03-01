<template>
    <h1 class="card center">
        <a :href="previousMonth">
            <i class="icss-caret-l"></i>
        </a>
        <span style="margin-left: 0.5em; margin-right: 0.5em;">{{ date.toLocaleDateString((navigator && navigator.language) || "en", {month: "long"}) }} {{ date.getUTCFullYear() }}</span>
        <a :href="nextMonth">
            <i class="icss-caret-r"></i>
        </a>
    </h1>
</template>
<script lang="ts">
export default {
    props: ["date"],

    computed: {
        previousMonth() {
            const [year, month] = this.getMonth(this.date, -1);
            return `/?year=${year}&month=${month}`
        },
        nextMonth() {
            const [year, month] = this.getMonth(this.date, +1);
            return `/?year=${year}&month=${month}`
        },
    },

    methods: {
        getMonth(date: Date, plusOrMinus: number) {
            let year = date.getUTCFullYear();
            const currMonth = date.getMonth() + 1;

            let nextMonth = currMonth + plusOrMinus;
            if (nextMonth > 12) {
                nextMonth = (nextMonth % 12) - 1
                year++;
            } else if (nextMonth < 1) {
                nextMonth = ((nextMonth + 12) % 12) - 1
                year--;
            }
            return [year, nextMonth];
        }
    }
}
</script>
<style lang="scss" scoped>
a {
    display: flex;
    align-items: center;
    color: var(--color-grey-light-1);
}
</style>