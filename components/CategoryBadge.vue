<template>
    <a @click="$emit('selected', category.name)" class="badge">
        <p>
            <!-- <Icon v-if="category && category.icon" :iconName="category.icon" /> -->
            <span>{{ category.name }}</span>
        </p>
    </a>
</template>
<script lang="ts" setup>
import { shouldInvert } from '~/utils/color';

const props = defineProps<{ category: Category }>();

const textColor = computed(() => {
    if (props.category.color) {
        return shouldInvert(props.category.color) ? 'var(--bg-200)' : 'var(--text-200)';
    }

    return;
})

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

    transition: filter .2s ease-in-out;
    &:hover {
        filter: brightness(1.2);
    }

    
    i {
        margin-right: 0.5em;
        color: v-bind('category.color');
    }
    
    p {
        text-align: center;
        padding: .3rem;
        border-radius: .3rem;
        font-weight: 400;
        color: v-bind("textColor");
        // text-shadow: 1px 1px 3px v-bind("textColor");
        transition: .2s ease-in-out;
    }
}
</style>