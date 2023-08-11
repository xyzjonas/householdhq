<template>
    <div class="amount">
        <span>{{ new Intl.NumberFormat().format(amount) }}</span>
        <span style="font-size: medium; margin-left: 2px;">{{ curr }}</span>
    </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTransactionStore } from '@/stores/transactions';

const props = defineProps({
    amount: {
        type: Number,
        default: 0,
    },
    size: {
        type: String,
        default: 'x-large'
    }
});

const { currency } = storeToRefs(useTransactionStore());

// num = new Intl.NumberFormat('hi-IN', { style: 'currency', currency: 'INR' }).format(number);
const curr = computed(() => {
    if (currency.value === 'CZK') {
        return 'Kč';
    }
    return currency.value;
})

</script>
<style lang="scss" scoped>
.amount {
    font-size: v-bind('size');
    font-family: sans-serif;
}
</style>