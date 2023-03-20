<template>
    <div class="date-card">
        <div class="day-number">{{ date.getDate() }}</div>
        <div class="day">{{ day }}</div>
    </div>
</template>
<script>
export default {

    props: ["date"],

    data() {
        return {
            weekDays: this.getWeekDays(),
        }
    },  

    computed: {
        day() {
            return this.weekDays[this.date.getDay()];
        },
        month() {
            return this.date.getMonth() + 1;
        },
    },

    methods: {
        getWeekDays() {
            const locale = this.$i18n.locale;
            const baseDate = new Date(2023, 2, 19); // just a Sunday
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