<template>
    <div>
        <div class="input row-simple">
            <div v-if="value !== valueCopy" style="margin-right: 1em;">
                <button @click="send" class="success">{{ $t('ok') }}</button>
                <button @click="valueCopy = value">{{ $t('cancel') }}</button>
            </div>
            <label id="test_wrapper" class="color-circle" :style="`background-color: ${valueCopy}`">
                <input
                    id="primary_color"
                    @change="update"
                    type="color"
                    v-model="valueCopy"
                >
            </label>
        </div>
    </div>
</template>
<script>
export default {

    props: ['value', 'keyName'],

    data() {
        return {
            editting: false,
            valueCopy: null
        }
    },

    methods: {
        send() {
            const data = {};
            data[this.keyName] = this.valueCopy;
            this.$emit('send', data);
        }
    },

    created() {
        this.valueCopy = this.value;
    }
    
}
</script>
<style lang="scss" scoped>
.color-circle {
    display: block;
    width: 30px;
    height: 30px;
    border-radius: 15px;
    border: 1px solid;
    border-color: var(--color-grey-dark-3);
    margin-right: 0;

    input[type=color] {
        position: fixed;
        max-width: 0;
        visibility: hidden;
    }
}
button {
    margin-left: 3px;
    padding-left: 0.5em;
    padding-right: 0.5em;
}
</style>