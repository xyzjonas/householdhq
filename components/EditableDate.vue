<template>
    <div>
        <div v-if="editting" class="input">
            <input id="firstname" class="input" type="date" v-model="valueCopy"/>
            <button @click="editting = false">cancel</button>
        </div>
        <p v-else @click="editting = true">{{ displayDate }}</p>
    </div>
</template>
<script>
export default {

    props: ['date'],

    data() {
        return {
            editting: false,
            valueCopy: null,
            displayDate: null
        }
    },

    created() {
        const locale = this.$i18n.locale;
        const parsedDate = new Date(this.date);
        this.displayDate = parsedDate.toLocaleDateString(locale);

        this.valueCopy = `${parsedDate.getUTCFullYear()}-${parsedDate.getMonth() + 1}-${parsedDate.getDate()}`;
    }
    
}
</script>
<style lang="scss" scoped>
</style>