<template>
    <i v-if="icon" :class="icon" style="font-size: 1.5em;"></i>
</template>

<script>
export default {
    props: [ "iconName" ],
    
    computed: {
        icon() {
            if (this.iconName) {
                return `icss-${this.iconName}`
            }
        }
    }
    
}
</script>
<style lang="">
    
</style>