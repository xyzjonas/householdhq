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
        }
    }
}
</script>
<style lang="scss" scoped>
.balance-row {
    display: flex;

    * {
        flex: 15 1 50%;
    }
}
</style>