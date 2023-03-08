<template>
    <h1 class="card center" style="font-size: 1.5em;">
        <a :href="previousMonth">
            <i class="icss-caret-l"></i>
        </a>
        <span style="margin-left: 0.5em; margin-right: 0.5em;">{{ formatMMYYYY() }}</span>
        <a :href="nextMonth">
            <i class="icss-caret-r"></i>
        </a>
    </h1>
</template>
<script>
export default {
    props: ["date"],

    computed: {
        previousMonth() {
            const [year, month] = this.getMonth(this.date, -1);
            console.info(year)
            return `/?year=${year}&month=${month}`
        },
        nextMonth() {
            const [year, month] = this.getMonth(this.date, +1);
            return `/?year=${year}&month=${month}`
        },
    },

    methods: {

        formatMMYYYY() {
            const locale = this.$i18n.locale;
            const month = this.date.toLocaleDateString(locale, {month: "long"}).toUpperCase();
            return `${month} ${this.date.getUTCFullYear()}`;
        },

        getMonth(date, plusOrMinus) {
            let year = date.getUTCFullYear();
            const currMonth = date.getMonth();  // ...0-11
            let nextMonth = currMonth + plusOrMinus;
            if (nextMonth > 11) {
                nextMonth = (nextMonth % 11)
                year++;
            } else if (nextMonth < 0) {
                nextMonth = (nextMonth % 11) + 12
                year--;
            }
            // and back to 12 digit format
            nextMonth++;
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