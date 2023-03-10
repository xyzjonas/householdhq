<template lang="">
    <div class="frame">
        <div class="row-simple">
            <button @click="$emit('cancel')" style="margin-left: auto">{{ $t('cancel') }}</button>
        </div>
        <div v-if="stage === 1">
            <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                <p>{{ $t('t_amount') }}</p>
                <input v-model.number="transaction.amount"/>
            </div>
            {{transaction.created}}
            <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                <p>{{ $t('t_date') }}</p>
                <input v-model="transaction.created" type="date"/>
            </div>
            <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                <p>{{ $t('t_desc') }}</p>
                <textarea v-model="transaction.description" type="date"/>
            </div>
            <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                <p>{{ $t('t_from') }}</p>
                <select v-model.number="transaction.sourceId">
                    <option :value="1">Účet u ČS</option>
                </select>
            </div>
            <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                <p>{{ $t('t_to') }}</p>
                <select>
                    <option :value="1">Pryč</option>
                </select>
            </div>
            <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                <p>{{ $t('t_tag') }}</p>
                <select v-model="transaction.tags">
                    <option v-for="tag in tags" :value="tag.tag.name">{{ tag.tag.name }}</option>
                </select>
            </div>
            <div class="space"></div>

            <div class="row">
                <button @click="$emit('cancel')">{{ $t('cancel') }}</button>
                <button @click="stage -= 1" style="margin-left: auto">{{ $t('back') }}</button>
                <button @click="send" class="success" style="margin: 5px">{{ $t('t_send') }}</button>
            </div>
        </div>
        <div v-else-if="stage === 2"></div>
        <div v-else>
            <Price :amount="transaction.amount"  style="font-size: xx-large; padding: 0.5em" />
            <div class="numpad">
                <div class="button" v-for="index in 9">
                    <button @click="add(index)" style="width: 100%">{{ index }}</button>
                </div>
            </div>
            <div class="numpad">
                <div class="button"><button class="danger" @click="remove">DEL</button></div>
                <div class="button"><button @click="add(0)">0</button></div>
                <div class="button"><button class="success" @click="stage+=1">OK</button></div>
            </div>
        </div>

    </div>
</template>
<script>
import { Price } from "#components";

export default {

    components: { Price },

    props: ['tags'],

    data() {
        return {
            stage: 0,
            transaction: {
                created: `${new Date().getUTCFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
                amount: 0,
                description: this.$t('t_placeholder'),
                sourceId: 1
            }
        }
    },

    methods: {
        add(amount) {
            this.transaction.amount = parseInt(`${this.transaction.amount}${amount}`);
        },
        remove() {
            const amountStr = `${this.transaction.amount}`;
            this.transaction.amount = parseInt(amountStr.substring(0, amountStr.length - 1)) || 0
        },
        send() {
            this.$emit('send', this.transaction)
        }
    }
}
</script>
<style lang="scss" scoped>
.frame {
    border: 1px solid;
    padding: 2em 1em 2em 1em;
    border-color: var(--color-grey-dark-3);
    border-radius: 3px;
}

.button {
    padding: 3px;
    min-height: 5em;

    button {
        font-size: xx-large;
        height: 100%;
        width: 100%;
    }
}

.row {
    p {
        margin-right: 1em;
        min-width: 4em;
    }

    textarea {
        width: 100%;
    }
}
</style>