<template>
    <button :class="clazz" :disabled="disabled || loading">
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
    height?: string,
    disabled?: boolean,
    color?: 'danger' | 'success'
}>()

const clazz = computed(() => {
    let cls = props.outlined ? 'ui-btn-outlined' : 'ui-btn';
    if (props.color) {
        cls += ` ${props.color}`
    }
    return cls;
})

</script>

<style lang="scss" scoped>

@mixin common() {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    gap: 4px;
    border: 1px solid var(--color-primary);
    width: v-bind(width);
    height: v-bind(height);

    i {
        transform: translateY(1px)
    }
}


.ui-btn {
    @include common();
    background-color: var(--color-primary);
    color: var(--color-font-gray);

    &:hover {
        border-color: var(--color-font-dark);
        cursor: pointer;
    }

    &.danger {
        background-color: var(--color-danger);
        color: var(--color-font-light);
        border-color: var(--color-danger);
    }

    &.success {
        background-color: var(--color-success);
        color: var(--color-font-dark);
        border-color: var(--color-success);
    }
}

.ui-btn-outlined {
    @include common();
    background-color: var(--color-foreground-dark);
    // border: 1px solid var(--color-primary);
    color: var(--color-primary);
    // width: v-bind(width);

    i {
        color: var(--color-primary) !important;
    }

    &:hover {
        background-color: var(--color-primary);
        color: var(--color-font-gray);
        cursor: pointer;
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