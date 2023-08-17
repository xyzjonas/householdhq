<template>
    <button class="ui-btn">
        <spinner v-if="loading" />
        <div v-else>
            <i v-if="icon" :class="icon"></i>
            <slot />
        </div>
    </button>
</template>

<script setup lang="ts">
defineProps<{
    loading: boolean,
    icon: string
}>()
</script>

<style lang="scss" scoped>
.ui-btn {
    display: grid;
    justify-content: center;
    border: 1px solid var(--color-primary-light-1);

    &:hover {
        border-color: #aaa;
    }
}
</style>