<template>
    <div v-if="pathSegments.length" class="crumbs">
        <NuxtLink id="home" to="/" class="segment i-ic-baseline-home" />
        <span v-for="segment, index in pathSegments">
            <i class="i-ic-baseline-chevron-right"></i>
            <NuxtLink
                :to="`/${pathSegments.slice(0, index + 1).join('/')}`"
                class="segment capitalize">{{ segment }}
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
    transform: translateY(-1px);
}

.crumbs {
    display: flex;
    flex-direction: row;
    margin-bottom: 1.5em;
    color: var(--text-100);
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--bg-300);

    span {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
}

a {
    color: var(--text-100);
    transition: .3s ease-in-out;

    &:hover {
        filter: opacity(.8);
    }
}

.caret {
    margin-left: 1em;
    margin-right: 1em;
    font-size: 0.8em;
}

.segment {
    margin-inline: 8px;
    transition: 0.2s color;
}

</style>