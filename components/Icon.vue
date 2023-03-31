<template>
    <i v-if="icon" :class="icon"></i>
</template>

<script>
export default {
    props: [ "iconName" ],
    
    computed: {
        icon() {
            if (this.iconName) {
                return `fa-solid fa-${this.iconName}`
            }
        }
    }
    
}
</script>
<style lang="">
</style>