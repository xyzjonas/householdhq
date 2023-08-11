<template>
    <div class="card my center">
        <section class="hdr">
            <p class="in">
                <i class="fa-solid fa-arrow-trend-up"></i>
                {{ new Intl.NumberFormat().format(income) ?? 'N/A' }}
                {{ income ? currency : ''}}
            </p>
            <p class="separator"></p>
            <p class="out">
                <i class="fa-solid fa-arrow-trend-down"></i>
                {{ new Intl.NumberFormat().format(expense) ?? 'N/A' }}
                {{ expense ? currency : ''}}
            </p>
        </section>
    </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTransactionStore } from '@/stores/transactions';


const transactionStore = useTransactionStore();
const { currency } = storeToRefs(transactionStore);

defineProps(["expense", "income"])
</script>
<style lang="scss" scoped>
.separator {
    height: 2em;
    border-left: 1px solid var(--color-primary-light-1);
}

p {
    font-weight: 1000;
}

i {
    margin-right: 8px;
}

.in {
    color: var(--color-success)
}

.out {
    color: var(--color-danger)
}

.hdr {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}
</style>