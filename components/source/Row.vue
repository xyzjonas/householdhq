<template>
    <NuxtLink :to="`/sources/${source.id}`" class="transaction">
        <h5 class="item">{{ source.name }}</h5>
    </NuxtLink>
</template>

<script lang="ts" setup>
import type { Source } from '~/stores/types';

defineProps<{ source: Source }>();
</script>

<style lang="scss" scoped>
.transaction {
    border: 0;
    border-left: solid .3rem;
    border-left-color: v-bind('source.color') !important;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    transition: .2s;

    &:hover {
        border-left: solid 1rem;
    }

}

.wrapper {
    display: flex;
    flex-direction: row;
    cursor: pointer;
    

    .panel {
        overflow: hidden;
        display: flex;
        align-items: center;
        transition: 250ms;
        padding-top: 0.25em;
        padding-bottom: 0.25em;
        
        .y {
            flex-direction: column;
        }

        button {
            height: 100%;
            width: 4em;
            margin-left: 5px;
            flex: auto;
        }
    }
}

h5 {
    text-transform: uppercase;
    font-size: 1.1em;
}

</style>
    