<template>
    <NuxtLink :to="`/tags/${tagInfo.tag.id}`" class="card">
        <div class="row">
            <div>{{ tagInfo.tag.name.toUpperCase() }}</div>
            <div class="amount">{{ sum || 0 }}<span style="font-size: medium;">{{ getCurrency() }}</span></div>
        </div>
    </NuxtLink>
</template>
<script>
export default {
    props: ["tagInfo"],

    computed: {
        sum() {
            let total = 0;
            this.tagInfo.transactions.forEach(t => total += t.amount)
            return total;
        },
        tagColor() {
            return `${this.tagInfo.tag.color}52` || null;
        },
        tagBorderColor() {
            return `${this.tagInfo.tag.color}99` || "#333";
        }
    },
    methods: {

        getCurrency() {
            const curr = this.tagInfo.transactions[0].currency
            if (curr === "CZK") {
                return 'Kč'
            }
            return 
        }

    }
}
</script>
<style scoped lang="scss">
.card {
    text-decoration: none;
    color: var(--color-grey-light-1);
    border: 1px solid transparent;
    background-color: v-bind('tagColor');
}

.card:hover {
    border: solid 1px;
    border-color: v-bind('tagBorderColor');
}

.amount {
    margin-left: auto;
    padding-left: 1em;
    font-size: xx-large;
    font-family: monospace;
}
</style>
