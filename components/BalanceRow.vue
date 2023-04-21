<template>
    <div class="balance-row">
        <Price :amount="total" :currency="currency.value" class="sum" />
        <div>
            <BalanceItem v-for="bal in sources" :source="bal" :max="max"/>
            <NuxtLink to="/sources">. . .</NuxtLink>
        </div>
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
    display: flex;
    flex-direction: row;
    
    .sum {
        text-align: center;
        flex-grow: 1;
        font-size: xx-large;
        border-right: 1px solid var(--color-primary-light-1);
        margin-right: 0.6em;
    }

    div {
        flex-grow: 2;
    }
}
</style>