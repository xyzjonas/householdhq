<template>
    <div class="balance-row">
        <BalanceItem v-for="bal in sources" :source="bal" :max="max"/>
    </div>
</template>
<script>
import { BalanceItem } from '#components';
import { max } from 'class-validator';

export default {
    components: { BalanceItem },
    props: ["sources"],

    computed: {
        max() {
            let max = 0;
            this.sources.forEach(source => { if (source.balance && source.balance > max) { max = source.balance; } });
            return max;
        },
        total() {
            return {
                id: 3,
                name: "cash J",
                isOut: false,
                color: "#bab98c",
                states: [ { "id": 4, "created": "2023-02-14T00:00:00.000Z", "amount": 0, "sourceId": 3 } ], "balance": -4198 } 
        }
    }
}
</script>