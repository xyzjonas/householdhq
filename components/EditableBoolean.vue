<template>
    <div class="row-simple">
        <div v-if="editting" class="input row-simple">
            <input v-model="valueCopy" type="checkbox">
            <button @click="send" class="success">{{ $t('ok') }}</button>
            <button @click="editting = false">{{ $t('cancel') }}</button>
        </div>
        <p v-else @click="editting = true" style="text-align: end;">
            {{ valueCopy ? $t('yes') : $t('no') }}
        </p>
    </div>
</template>
<script>
export default {

    props: ['value', 'keyName'],

    data() {
        return {
            editting: false,
            valueCopy: undefined,
            columns: 15,
        }
    },

    computed: {
        rowCount() {
            if (this.valueCopy) {
                return Math.round(this.valueCopy.length / this.columns) || 1;
            }
            return 1;
        }
    },

    created() {
        this.valueCopy = this.value;
    },

    methods: {
        send() {
            const data = {};
            data[this.keyName] = this.valueCopy;
            this.$emit('send', data);
            this.editting = false;
        }
    },
    
}
</script>
<style lang="scss" scoped>
button {
    margin-left: 3px;
}
</style>