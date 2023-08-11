<template>
    <div class="container more-p">
        <h1 class="title">
            <Price :amount="transaction.amount" :currency="transaction.currency" />
        </h1>
        <div class="row">
            <p class="item">{{ $t('t_date') }}</p>
            <form-editable-date class="item" :date="transaction.created"/>
        </div>
        <div class="row">
            <div class="item">{{ $t('t_desc') }}</div>
            <form-editable-field class="item" :value="transaction.description"/>
        </div>
        <div class="row">
            <div class="item">{{ $t('t_amount') }}</div>
            <form-editable-field class="item" :value="transaction.amount"/>
        </div>
        <div class="row">
            <div class="item">{{ $t('t_tag') }}</div>
            <div class="item">
                <div v-for="tag in transaction.tags">
                    <form-editable-tag class="item" :tag="tag"/>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
const route = useRoute()
const { data: transaction } = await useFetch(`/api/transactions/${route.params.id}`)
</script>
<script>
import { Price, FormEditableField, FormEditableDate, FormEditableTag } from '#components';

export default {
    components: { Price, FormEditableField, FormEditableDate, FormEditableTag }
}
</script>
<style lang="scss" scoped>
.row > * {
    max-width: 70%;
    min-height: 2.5em;
    text-align: end;

    margin-top: 0.5em;
}
</style>
