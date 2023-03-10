<template>
    <div>
        <div v-if="editting" class="input">
            <textarea v-model="valueCopy" cols="20" :rows="Math.round(valueCopy.length/20) || 1"></textarea>
            <button @click="editting = false" class="success">{{ $t('ok') }}</button>
            <button @click="editting = false">{{ $t('cancel') }}</button>
        </div>
        <p v-else @click="editting = true" style="text-align: end;">{{ value }}</p>
    </div>
</template>
<script>
export default {

    props: ['value'],

    data() {
        return {
            editting: false,
            valueCopy: null
        }
    },

    created() {
        this.valueCopy = this.value;
    }
    
}
</script>
<style lang="scss" scoped>
button {
    margin-left: 3px;
}
</style>