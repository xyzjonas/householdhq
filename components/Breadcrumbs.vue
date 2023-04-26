<template lang="">
    <div v-if="pathSegments.length" class="container crumbs">
        <NuxtLink to="/" class="segment"><i class="fa-solid fa-house"></i></NuxtLink>
        <span v-for="segment, index in pathSegments">
            / <NuxtLink :to="`/${pathSegments.slice(0, index + 1).join('/')}`" class="segment">{{ segment }}</NuxtLink>
        </span>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const pathSegments = computed(() => {
    const path = route.fullPath.split("?")[0];
    return path.split("/").filter(s => s)
});
</script>

<style scoped lang="scss">
.crumbs {
    margin-top: 1em;
    margin-bottom: 1.5em;
}

.segment {
    margin-left: 0.3em;
    margin-right: 0.3em;
    font-weight: 600;

    &:hover {
        filter: brightness(0.7);
    }
}
</style>