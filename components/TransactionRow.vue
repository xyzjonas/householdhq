<template>
<div :style="transparent && !details ? transparentStyle : ''">
    <div class="wrapper">
        <div 
            :class="`transaction ${transaction.target.isOut ? '' : 'income'}`"
            :style="`width: ${details ? 60 : 100}%`"
            @click="details = !details"
        >
            <div class="item">
                <DateTile :date="date"/>
            </div>
            <div class="item">
                {{ transaction.description }}
                <br>
                <small style="font-size: xx-small">{{ transaction.source.name }} <i class="fa-solid fa-arrow-right"></i> {{ transaction.target.name }}</small>
            </div>
            <p class="item">
                <ui-price :amount="transaction.amount" :currency="transaction.currency" />
            </p>
        </div>
        <div class="panel" :style="`width: ${details ? 40 : 0}%`">
            <button class="danger" @click="$emit('delete', { id: transaction.id })">{{ $t('delete') }}</button>
            <button @click="edit = !edit">{{ edit ? $t('cancel') : $t('edit') }}</button>
        </div>
        <div class="panel y" :style="`width: ${confirmable ? 20 : 0}%`">
            <button class="success" @click="patchTransaction({ id: transaction.id, confirmed: true, created: transaction.created })">
                {{ $t('confirm') }}
                <span v-if="transaction.recurring > 0">
                    <br>
                    <small>{{ $t('t_new_recurring') }} {{ transaction.recurring }} {{ $t('months') }}</small>
                </span>
            </button>
        </div>
    </div>
    <transition name="page" mode="in-out">
    <div v-if="edit && details">
        <TransactionForm
            :transactionIn="transaction"
            :startStage="2"
            :processing="patching"
            :error="patchingError"
            @cancel="edit = false"
            @send="patchTransaction"
        />
    </div>
    </transition>
</div>
</template>
<script>
export default {

    props: ['transaction', 'transparent'],

    data() {
        return {
            details: false,
            edit: false,
            transparentStyle: '',
            patching: false,
            patchingError: undefined,
        }
    },

    async created() {
        if(this.transparent) {
            this.transparentStyle = 'filter: opacity(0.3);'
        }
    },

    // methods: {
    //     patchTransaction(transactionData) {
    //         this.patching = true;
    //         const url = "/api/transactions";
    //         $fetch(url, {
    //             method: 'PATCH',
    //             headers: {
    //                 Authorization: 'Bearer ' + this.token
    //             },
    //             body: transactionData
    //         })
    //             .then(res => {
    //                 this.$emit('patched', res.data);
    //                 this.edit = false;
    //                 this.details = false;
    //             })
    //             .catch(err => {
    //                 this.patchingError = err.data.statusMessage;
    //             })
    //             .finally(() => { this.patching = false;  })
    //     },
    // },  

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
        confirmable() {
            return !this.transaction.confirmed && this.date <= new Date();
        },
    },
}
</script>
<style lang="scss" scoped>
.transaction {
    border-right: solid 10px;
    border-right-color: v-bind('tagColor');
    transition: 250ms;

    &:hover {
        transition: 250ms;
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
        
        .y {
            flex-direction: column;
        }

        button {
            height: 100%;
            width: 4em;
            margin-left: 5px;
            flex: auto;
        }
    }
}

.income {
    border-color: var(--color-success);
}

</style>
