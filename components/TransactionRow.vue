<template>
    <NuxtLink :to="`/transactions/${transaction.id}`" class="transaction">
    <!-- <div class="transaction"> -->
        <!-- <NuxtLink v-if="firstTag" :to="`/tags/${firstTag.id}`"></NuxtLink> -->
        <div class="item">
            <!-- <span><CategoryBadge :category="firstTag" /></span> -->
            <DateTile :date="date"/>
            <!-- <span>{{ day }}.{{ month }}.</span> -->
        </div>
        <div class="item">{{ transaction.description }}</div>
        <p class="item">
            <Price :amount="transaction.amount" :currency="transaction.currency" />
            <!-- <span>{{ transaction.amount }}&nbsp;{{ transaction.currency }}</span> -->
        </p>
    </NuxtLink>
</template>
<script>
import { CategoryBadge, Price, DateTile } from '#components';

export default {

  components: { CategoryBadge, Price, DateTile },
    
    props: ['transaction'],

    computed: {
        date() {
            return new Date(this.transaction.created);
        },
        firstTag() {
            if (this.transaction.tags.length > 0) {
                return this.transaction.tags[0];
            }
            return undefined;
        },
        tagColor() {
            if (this.firstTag && this.firstTag.color) {
                return `${this.firstTag.color}52`;
            }
            return '#00000000';
        },
    }
}
</script>
<style lang="scss" scoped>
.transaction {
    border-right: solid 10px;
    border-right-color: v-bind('tagColor');

    &:hover {
    border-right-color: v-bind('tagColor');
}
}

</style>
