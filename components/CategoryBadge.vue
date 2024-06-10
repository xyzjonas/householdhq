<template>
    <a @click="$emit('selected', category.name)" class="badge">
        <p>
            <!-- <Icon v-if="category && category.icon" :iconName="category.icon" /> -->
            <span>{{ category.name }}</span>
        </p>
    </a>
</template>
<script lang="ts" setup>
import type { Category } from '~/types';
import { shouldInvert } from '~/utils/color';

const props = defineProps<{ category: Category }>();

const textColor = computed(() => {
    if (props.category.color) {
        return shouldInvert(props.category.color) ? 'black' : 'white';
    }

    return;
})

</script>
<style lang="scss" scoped>
.badge {
    border-radius: 5px;
    display: grid;
    align-content: center;
    cursor: pointer;
    background-color: v-bind('category.color');
    overflow: hidden;

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