<template>
    <a @click="$emit('selected', category.name)" class="badge">
        <p>
            <Icon v-if="category && category.icon" :iconName="category.icon" />
            <span>{{ category.name }}</span>
        </p>
    </a>
</template>
<script>
import { Icon } from '#components';
export default {
    components: { Icon },
    props: ['category'],
}
</script>
<style lang="scss" scoped>
.badge {
    border: 1px solid;
    border-radius: 5px;
    border-color: var(--color-primary-dark-3);
    aspect-ratio: 1.5;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
        border-color: v-bind('category.color');
    }

    i {
        // font-size: small;
        margin-right: 0.5em;
        color: v-bind('category.color');
    }

    p {
        text-align: center;
    }
}
</style>