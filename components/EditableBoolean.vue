<template>
    <div class="row-simple">
        <div class="slideOne" @click="send">
            <input v-model="valueCopy" type="checkbox" id="slideOne" name="check" disabled/>
            <label for="slideOne"></label>
        </div>
    </div>
</template>
<script>
export default {

    props: ['value', 'keyName'],

    data() {
        return {
            valueCopy: undefined,
        }
    },

    created() {
        this.valueCopy = this.value;
    },

    methods: {
        send() {
            this.valueCopy = !this.valueCopy;
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