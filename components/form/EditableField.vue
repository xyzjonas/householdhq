<template>
    <div class="row-simple">
        <div v-if="editting" class="input row-simple">
            <textarea
                v-model="valueCopy"
                cols="20"
                :rows="rowCount"
                :placeholder="$t('undefined')"
            ></textarea>
            <ui-button @click="send" color="success" height="2rem" width="2rem">{{ $t('ok') }}</ui-button>
            <ui-button @click="editting = false" color="secondary"  height="2rem" width="3rem">{{ $t('cancel') }}</ui-button>
        </div>
        <p v-else @click="editting = true" style="text-align: end;">{{ value || $t('undefined')}}</p>
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