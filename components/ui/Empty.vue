<template>
    <section class="empty">
        <spinner v-if="loading" name="roller"/>
        <section v-else>
            <h1 v-show="icon"><i :class="icon"></i></h1>
            <h1>{{ title }}</h1>
            <h5 v-show="subtitle">{{ subtitle }}</h5>
        </section>
    </section>
</template>
<script setup lang="ts">
const props = defineProps<{
    loading?: boolean,
    icon?: string,
    title: string,
    subtitle?: string,
}>();
</script>
<style lang="scss" scoped>
@import '@/assets/css/base.scss';

.empty {
    // background-color: var(--color-primary-dark-2-rgb), 0.3);

    border-radius: 3px;

    padding: 16px;

    display: grid;
    gap: 8px;
    justify-content: center;
    align-content: center;
    width: 100%;

    @media only screen and (max-width: $bp-small) {
        height: 240px;
    }

    text-align: center;

    h1, h5 {
        text-transform: uppercase;
    }

    h1 {
        font-size: 2em;
    }

    h5 {
        font-size: 0.8em;
        font-weight: 100;
    }
}
</style>