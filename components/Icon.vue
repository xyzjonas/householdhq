<template>
    <i v-if="icon" :class="icon" style="color: white; margin-left: 0.4em;"></i>
</template>

<script>
export default {
    props: [ "iconName" ],
    
    computed: {
        icon() {
            if (this.iconName) {
                return `gg-${this.iconName}`
            }
        }
    }
    
}
</script>
<style lang="">
    
</style>