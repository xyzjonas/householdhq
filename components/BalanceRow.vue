<template>
    <div class="balance-row">
        <div class="balance-row-hdr">
            <p>{{ $t('balance') }}</p>
            <Price :amount="total" :currency="currency.value" />
        </div>
        <BalanceItem v-for="bal in sources" :source="bal" :max="max" class="balance-row-item"/>
        <NuxtLink to="/sources" class="ml">. . .</NuxtLink>
    </div>
</template>
<script>
import { BalanceItem, Price } from '#components';
import { max } from 'class-validator';

export default {
    components: { BalanceItem, Price },
    props: ["sources"],
    inject: ["currency"],

    computed: {
        max() {
            let max = 0;
            this.sources.forEach(source => { if (source.balance && source.balance > max) { max = source.balance; } });
            return max;
        },
        total() {
            let sum = 0;
            this.sources.forEach(source => {
                if(source.balance) {
                    sum += source.balance;
                }
            })
            return sum
        }
    }
}
</script>
<style lang="scss" scoped>
.balance-row {
    &-hdr {
        p {
            text-transform: uppercase;
            font-size: large;
        }
        font-weight: 1000;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--color-primary-light-1);
    }
}
</style>