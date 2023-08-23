<template>
    <NuxtLink :to="`/sources/${source.id}`" class="transaction">
        <h5 class="item">{{ source.name }}</h5>
    </NuxtLink>
    </template>
    <script>
    
    export default {

        props: ['source'],
    
    }
    </script>
    <style lang="scss" scoped>
    .transaction {
        border-right: solid 10px;
        border-right-color: v-bind('tagColor');
        transition: 250ms;
    
        &:hover {
            transition: 250ms;
            border-right-color: v-bind('tagColor');
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
    