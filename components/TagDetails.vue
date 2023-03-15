<template>
    <section>
        <button @click="$emit('cancel')">{{ $t('back') }}</button>
        <button style="margin-left: 0.5em;">
            <NuxtLink :to="`/tags/${tagId}`">{{ $t('edit') }}</NuxtLink>
        </button>
    </section>
</template>
<script>
export default {

    props: ['tagId']
    
}
</script>
<style lang="scss" scoped>
section {
    padding: 1em
}
</style>