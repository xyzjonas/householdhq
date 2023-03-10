<template>
    <div>
        <!-- <div v-if="editting" class="input">
            <textarea v-model="valueCopy" cols="20" :rows="Math.round(valueCopy.length/20) || 1"></textarea>
            <button @click="editting = false" class="success">{{ $t('ok') }}</button>
            <button @click="editting = false">{{ $t('cancel') }}</button>
        </div> -->
        <p @click="editting = true" class="tag">{{ tag.name }}</p>
    </div>
</template>
<script>
export default {

    props: ['tag'],

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
.tag {
    background-color: v-bind('tag.color');
    border-radius: 4px;
    padding: 0.3em 1em 0.3em 1em
}
</style>