<template>
    <section class="title">
        <!-- <UserBadge /> -->
        <p>{{ formatMMYYYY() }}</p>
        <!-- <a><i class="fa-solid fa-calendar"></i></a> -->
        <NuxtLink :to="previousMonth" @click="$emit('reload', prev)" class="left">
            <i class="fa-solid fa-chevron-left"></i>
        </NuxtLink>
        <NuxtLink :to="previousMonth" @click="$emit('reload', next)" class="right">
            <i class="fa-solid fa-chevron-right"></i>
        </NuxtLink>
    </section>
</template>
<script>
import { UserBadge } from '#components';

export default {

    components: { UserBadge },
    props: ["date"],

    computed: {
        prev() {
            const [year, month] = this.getMonth(this.date, -1);
            return { year: year, month: month }
        },
        next() {
            const [year, month] = this.getMonth(this.date, +1);
            return { year: year, month: month }
        },
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

        formatMMYYYY() {
            const locale = this.$i18n.locale;
            const month = this.date.toLocaleDateString(locale, {month: "long"}).toUpperCase();
            return `${month} ${this.date.getFullYear()}`;
        },

        getMonth(date, plusOrMinus) {
            let year = date.getFullYear();
            const currMonth = date.getMonth();  // ...0-11
            let nextMonth = currMonth;
            if (plusOrMinus > 0 && currMonth === 11) {
                nextMonth = 0;
                year++;
            } else if (plusOrMinus < 0 && currMonth === 0) {
                nextMonth = 11;
                year--;
            } else {
                nextMonth += plusOrMinus;
            }

            // and back to 12 digit format
            nextMonth++;
            return [year, nextMonth];
        }
    }
}
</script>
<style lang="scss" scoped>
.title {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.5em;

    p {
        font-size: x-large;
        font-weight: 600;
    }

}



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

.left, .right {
    font-size: small;
    color: var(--color-primary-light-1);
}

.left {
    margin-left: auto;
}

.right {
    margin-right: 2em;
}

.left:hover {
    color: var(--color-font-light);
}

.right:hover {
    color: var(--color-font-light);
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