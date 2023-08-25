<template lang="">
    <div v-if="pathSegments.length" class="crumbs">
        <NuxtLink to="/" class="segment"><i class="fa-solid fa-house"></i></NuxtLink>
        <span v-for="segment, index in pathSegments">
            <i class="fa-solid fa-angle-right caret"></i>
            <NuxtLink
                :to="`/${pathSegments.slice(0, index + 1).join('/')}`"
                class="segment">{{ segment }}
            </NuxtLink>
        </span>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const pathSegments = computed(() => {
    const fullPath = route.fullPath;

    // ignored pages:
    if (fullPath === '/login') {
        return []
    }

    const path = route.fullPath.split("?")[0];
    return path.split("/").filter(s => s)
});
</script>

<style scoped lang="scss">
.crumbs {
    display: flex;
    flex-direction: row;
    // margin-top: 1em;
    // margin-bottom: 1.5em;
    padding: 16px;
    padding-top: 16px;

    span {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
}

.caret {
    margin-left: 1em;
    margin-right: 1em;
    font-size: 0.8em;
}

.segment {
    margin-left: 0.3em;
    margin-right: 0.3em;
    font-weight: 600;
    transition: 0.2s color;

    &:hover {
        color: white;
    }
}
</style>