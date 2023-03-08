<template>
    <div class="amount">
        <span>{{ amount || 0 }}</span>
        <span style="font-size: medium; margin-left: 2px;">{{ getCurrency() }}</span>
    </div>
</template>
<script>
export default {
    props: ['amount', 'currency'],

    methods: {
        getCurrency() {
            if (this.currency === "CZK") {
                return 'Kč'
            }
            return 
        }
    }
}
</script>
<style lang="scss" scoped>
.amount {
    font-size: x-large;
    font-family: monospace;
}
</style>