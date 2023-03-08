<template>
    <div class="date-card">
        <div class="day-number">{{ date.getDate() }}</div>
        <div class="day">{{ day }}</div>
    </div>
</template>
<script>
export default {

    props: ["date"],

    computed: {
        day() {
            return this.getWeekDays()[this.date.getDay()];
        },
        month() {
            return this.date.getMonth() + 1;
        },
    },

    methods: {
        getWeekDays() {
            const locale = this.$i18n.locale;
            console.info(this.$i18n)
            console.info(this.$t('message'))
            var baseDate = new Date(Date.UTC(2017, 0, 2)); // just a Monday
            var weekDays = [];
            for(let i = 0; i < 7; i++)
            {       
                weekDays.push(baseDate.toLocaleDateString(locale, { weekday: 'long' }));
                baseDate.setDate(baseDate.getDate() + 1);       
            }
            return weekDays;
        }
    }
    
}
</script>
<style lang="scss" scoped>
.date-card{
    display:flex;
    padding-right: 1em;
    border-right: 1px solid gray;
    flex-direction: column;
    align-items:center;

    .day-number {
        font-size: xx-large;
        font-family: serif;
    }

    .day {
        font-size: x-small;
    }
}


</style>