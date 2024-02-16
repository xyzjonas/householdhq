<template>
    <div>
        <div class="input row-simple">
            <transition name="slide">
                <div v-if="value !== valueCopy" class="btn-group">
                    <ui-button
                        @click="send"
                        color="success"
                        width="2rem"
                        height="2rem"
                    >{{ $t('ok') }}</ui-button>
                    <ui-button
                        @click="valueCopy = value"
                        width="3rem"
                    >{{ $t('cancel') }}</ui-button>
                </div>
            </transition>
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

.btn-group {
    display: flex;
    gap: .1rem;

    margin-right: 1rem;
}
</style>