<template>
    <button :class="clazz" :disabled="disabled">
        <spinner v-if="loading" />
        <span v-if="!loading && icon" class="icon"><i :class="icon"></i></span>
        <slot v-if="!loading"/>
    </button>
</template>

<script setup lang="ts">
const props = defineProps<{
    loading?: boolean,
    icon?: string,
    outlined?: boolean,
    width?: string,
    disabled?: boolean,
}>()

const clazz = computed(() => {
    return props.outlined ? 'ui-btn-outlined' : 'ui-btn';
})

</script>

<style lang="scss" scoped>
.ui-btn {
    display: grid;
    justify-content: center;
    align-content: center;
    border: 1px solid var(--color-primary-light-1);
    background-color: var(--color-primary);
    color: var(--color-font-gray);
    width: v-bind(width);

    &:hover {
        border-color: #aaa;
    }
}

.ui-btn-outlined {
    background-color: var(--color-foreground-dark);
    border: 1px solid var(--color-primary);
    color: var(--color-primary);
    width: v-bind(width);


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

button[disabled] {
    background-color: #aaaaaa55;
    color: #ccc;
    border: 1px solid transparent;
    i {
        color: #ccc !important;
    }
    cursor: not-allowed;
}

</style>