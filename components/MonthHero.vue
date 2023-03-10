<template>
    <section class="title center">
        <a :href="previousMonth" class="left">
            <i class="icss-caret-l"></i>
        </a>
        <h1>{{ formatMMYYYY() }}</h1>
        <a :href="nextMonth" class="right">
            <i class="icss-caret-r"></i>
        </a>
    </section>
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
    font-size: large;
    color: var(--color-grey-light-1);
    transition-duration: 0.3s;
}

a:hover {
    transition-duration: 0.3s;
    transition: linear;
}

.left:hover {
    transform: translate(-2px)
}

.right:hover {
    transform: translate(2px)
}

h1 {
    font-size: x-large;
    margin-left: 0.5em;
    margin-right: 0.5em;
    text-align: center;
}
section {
    padding-top: 2em;
    padding-bottom: 2em;
}
</style>