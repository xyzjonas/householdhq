<template>
    <div>
        <div class="wrapper">
            <div 
                class="transaction"
                :style="`width: ${details ? 60 : 100}%`"
                @click="details = !details"
            >
                <div class="item">{{ source.id }}</div>
                <div class="item">{{ source.name }}</div>
            </div>
            <div class="panel" :style="`width: ${details ? 40 : 0}%`">
                <button class="danger" @click="$emit('delete', { id: source.id })">{{ $t('delete') }}</button>
                <button @click="edit = !edit">{{ edit ? $t('cancel') : $t('edit') }}</button>
            </div>
        </div>
    </div>
    </template>
    <script>
    import { CategoryBadge, Price, DateTile, Icon } from '#components';
    
    export default {
    
      components: { CategoryBadge, Price, DateTile, Icon },
        
        props: ['source'],
    
        data() {
            return {
                details: false,
                edit: false,
                patching: false,
            }
        },
    
        methods: {
            patchTransaction(transactionData) {
                this.patching = true;
                const url = "/api/transactions";
                $fetch(url, {method: 'PATCH', body: transactionData})
                    .then(res => this.$emit('patched', res.data))
                    .finally(() => { this.patching = false; this.edit = false; this.details = false })
            },
        },  
    
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
    
    </style>
    