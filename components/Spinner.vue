<template>
    <div>
        <div v-if="name === 'roller'" class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        <div v-else="name === 'ellipsis'" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
</template>
<script>
export default {
    props: ['name']
}
</script>
<style lang="">
    
</style>