<template lang="">
    <div>
        <h1>{{ transaction.description }}</h1>
        <div class="box">
            <div class="item">Amount</div>
            <div class="item">{{ transaction.amount }}</div>
        </div>
        <div class="box">
            <div class="item">Icon</div>
            <div class="item">{{ transaction.currency }}</div>
        </div>
        <div class="box">
            <div class="item">Parent</div>
            <div class="item">{{ transaction.tags }}</div>
        </div>
    </div>
</template>
<script setup>
const route = useRoute()
const { data: transaction } = await useFetch(`/api/transactions/${route.params.id}`)
</script>
