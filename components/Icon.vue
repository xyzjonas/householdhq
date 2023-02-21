<template>
    <div class="tag">
        <i v-if="icon" :class="icon"></i>
        <p v-else>
            {{ alt }}
        </p>

    </div>
</template>

<script>
export default {
    props: [ "iconName", "alt" ],
    
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