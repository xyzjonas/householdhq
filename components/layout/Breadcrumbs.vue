<template>
    <div v-if="pathSegments.length" class="crumbs">
        <NuxtLink id="home" to="/" class="segment i-ic-baseline-home" />
        <span v-for="segment, index in pathSegments">
            <i class="i-ic-baseline-chevron-right"></i>
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

    if (fullPath === '/login') {
        return []
    }

    const path = route.fullPath.split("?")[0];
    return path.split("/").filter(s => s)
});
</script>

<style scoped lang="scss">
#home {
    font-size: larger;
}

.crumbs {
    display: flex;
    flex-direction: row;
    margin-bottom: 1.5em;
    color: var(--bg-300);
    align-items: center;

    span {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
}

a {
    color: var(--bg-300);

    &:hover {
        color: var(--text-100)
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
    transition: 0.2s color;

    &:hover {
        color: white;
    }
}
</style>