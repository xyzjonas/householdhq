<template>
    <div class="container more-p">
        <h1 class="title">
            <Price :amount="transaction.amount" :currency="transaction.currency" />
        </h1>
        <div class="row">
            <p class="item">{{ $t('t_date') }}</p>
            <EditableDate class="item" :date="transaction.created"/>
        </div>
        <div class="row">
            <div class="item">{{ $t('t_desc') }}</div>
            <EditableField class="item" :value="transaction.description"/>
        </div>
        <div class="row">
            <div class="item">{{ $t('t_amount') }}</div>
            <EditableField class="item" :value="transaction.amount"/>
        </div>
        <div class="row">
            <div class="item">{{ $t('t_tag') }}</div>
            <div class="item">
                <div v-for="tag in transaction.tags">
                    <EditableTag class="item" :tag="tag"/>
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
import { Price, EditableField, EditableDate, EditableTag } from '#components';

export default {
    components: { Price, EditableField, EditableDate, EditableTag }
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
