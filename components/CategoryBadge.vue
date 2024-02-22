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
    // aspect-ratio: 1.5;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-color: v-bind('category.color');
    background-color: v-bind('category.color');
    backdrop-filter: opacity(.1);

    max-height: 7rem;

    
    i {
        margin-right: 0.5em;
        color: v-bind('category.color');
    }
    
    p {
        text-align: center;
        padding: .3rem;
        border-radius: .3rem;
        backdrop-filter: invert(20%) opacity(.3);
        font-weight: 500;
        color: white;
        text-shadow: 1px 1px 3px var(--bg-100);
        transition: .2s ease-in-out;
    }
    
    &:hover {
        p {
            backdrop-filter: invert(50%) opacity(.9);
        }
    }
}
</style>