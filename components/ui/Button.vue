<template>
    <button :class="clazz">
        <spinner v-if="loading" />
        <div v-else>
            <span v-if="icon" class="icon"><i :class="icon"></i></span>
            <slot />
        </div>
    </button>
</template>

<script setup lang="ts">
const props = defineProps<{
    loading?: boolean,
    icon?: string,
    outlined?: boolean,
}>()

const clazz = computed(() => {
    return props.outlined ? 'ui-btn-outlined' : 'ui-btn';
})

</script>

<style lang="scss" scoped>
.ui-btn {
    display: grid;
    justify-content: center;
    border: 1px solid var(--color-primary-light-1);
    background-color: var(--color-primary);
    color: var(--color-font-gray);

    &:hover {
        border-color: #aaa;
    }
}

.ui-btn-outlined {
    background-color: var(--color-foreground-dark);
    border: 1px solid var(--color-primary);
    color: var(--color-primary);

    i {
        color: var(--color-primary) !important;
    }

    &:hover {
        background-color: var(--color-primary);
        color: var(--color-font-gray);
        i {
            color: var(--color-font-gray) !important;
        }
    }
}

</style>