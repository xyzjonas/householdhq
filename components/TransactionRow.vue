<template>
    <div class="wrapper">
    <div 
        class="transaction"
        :style="`width: ${details ? 50 : 100}%`"
        @click="details = !details"
    >
        <div class="item">
            <DateTile :date="date"/>
        </div>
        <div class="item">{{ transaction.description }}</div>
        <p class="item">
            <Price :amount="transaction.amount" :currency="transaction.currency" />
        </p>
    </div>
    <div class="panel" :style="`width: ${details ? 50 : 0}%`">
        <button class="danger" @click="$emit('delete', { id: transaction.id })">{{ $t('delete') }}</button>
        <button>BAR</button>
    </div>
    </div>
</template>
<script>
import { CategoryBadge, Price, DateTile, Icon } from '#components';

export default {

  components: { CategoryBadge, Price, DateTile, Icon },
    
    props: ['transaction'],

    data() {
        return {
            details: false
        }
    },

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
                return `${this.firstTag.color}aa`;
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
    
    transition: 250ms;

    &:hover {
        border-right-color: v-bind('tagColor');
    }


}

.wrapper {
    display: flex;
    flex-direction: row;
    

    .panel {
        overflow: hidden;
        display: flex;
        align-items: center;
        transition: 250ms;
        padding-top: 0.25em;
        padding-bottom: 0.25em;

        button {
            height: 100%;
            width: 4em;
            margin-left: 5px;
            flex: auto;
        }
    }
}

</style>
